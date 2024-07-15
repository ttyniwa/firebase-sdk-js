import { AxiosStatic } from 'axios'
import * as firebaseAdmin from 'firebase-admin'
import { Response } from 'firebase-functions'
import { FreeeToken, SDKConfig } from '../const/types'
import { ConfigManager } from '../services/config-manager'
import { TokenManager } from '../services/token-manager'
import { AuthorizationCode } from 'simple-oauth2'

export class FreeeFirebaseAuthClient {
  private admin: firebaseAdmin.app.App
  private authorizationCode: AuthorizationCode // Can not use typescript version due to mismatch with freee oauth
  private axios: AxiosStatic
  private tokenManager: TokenManager
  private redirectPath: string
  private callbackPath: string
  private companiesPath: string
  private homePath: string
  private appHost: string
  private authHost: string
  // @ts-ignore  FIXME: tslint でエラーになる。不要なら削除する
  private apiKey?: string

  constructor(
    admin: firebaseAdmin.app.App,
    authorizationCode: AuthorizationCode,
    axios: AxiosStatic,
    tokenManager: TokenManager,
    config: SDKConfig,
  ) {
    this.admin = admin
    this.authorizationCode = authorizationCode
    this.axios = axios
    this.tokenManager = tokenManager
    // path setting
    this.redirectPath = ConfigManager.getFreeeConfig(config, 'redirectPath')
    this.callbackPath = ConfigManager.getFreeeConfig(config, 'callbackPath')
    this.companiesPath = ConfigManager.getFreeeConfig(config, 'companiesPath')
    this.homePath = ConfigManager.getFreeeConfig(config, 'homePath')
    this.appHost = ConfigManager.getFreeeConfig(config, 'appHost')
    this.authHost = ConfigManager.getFreeeConfig(config, 'authHost')
    this.apiKey = config.firebase && config.firebase.apiKey!
  }

  /**
   * Redirect screen to authorize
   */
  redirect(res: Response): void {
    const redirectUri = this.authorizationCode.authorizeURL({
      redirect_uri: `${this.authHost}${this.getCallbackPath()}`,
    })
    res.redirect(redirectUri)
  }

  /**
   * Get token, save it to firebase and login firebase
   */
  async callback(code: string, res: Response): Promise<void> {
    try {
      const result = await this.authorizationCode.getToken({
        code: code,
        redirect_uri: `${this.authHost}${this.getCallbackPath()}`,
      })

      const freeeToken = {
        accessToken: result.token.access_token as string,
        refreshToken: result.token.refresh_token as string,
        expiresIn: result.token.expires_in as number,
        createdAt: result.token.created_at as number,
      } satisfies FreeeToken

      // get freee user
      const response = await this.getFreeeUser(freeeToken.accessToken)

      const id = response.data.user.id
      const email = response.data.user.email
      // consider null value of displayName
      const displayName = response.data.user.display_name
        ? response.data.user.display_name
        : ''
      // Create a Firebase Account and get the custom Auth Token.
      const firebaseToken = await this.createFirebaseAccount(
        id,
        email,
        displayName,
        freeeToken,
      )
      // redirect to home path with token info
      res.redirect(`${this.appHost}${this.homePath}?token=${firebaseToken}`)
    } catch (error) {
      console.error('Some error occured on login process:', error)
      res.send(this.signInRefusedTemplate())
    }
  }

  /**
   * path for redirect on freee authorization
   */
  getRedirectPath(): string {
    return this.redirectPath
  }

  /**
   * path for callback on freee authorization
   */
  getCallbackPath(): string {
    return this.callbackPath
  }

  /**
   * path for callback on freee authorization
   */
  getCompaniesPath(): string {
    return this.companiesPath
  }

  /**
   * Create crypto key to bucket for it by specified date
   */
  async createCryptoKey(date: Date): Promise<void> {
    await this.tokenManager.createCryptoKey(date)
  }

  private getFreeeUser(accessToken: string) {
    return this.axios.get('/api/1/users/me?companies=true', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  }

  /**
   * create firebase account and token
   */
  private async createFirebaseAccount(
    id: number,
    email: string,
    displayName: string,
    freeeToken: FreeeToken,
  ): Promise<string> {
    const uid = id.toString()

    await this.tokenManager.save(uid, email, freeeToken)

    // Create or update the user account.
    await this.admin
      .auth()
      .updateUser(uid, {
        email: email,
        displayName: displayName,
      })
      .catch(async (error) => {
        if (error.code === 'auth/user-not-found') {
          return await this.admin.auth().createUser({
            uid: uid,
            email: email,
            displayName: displayName,
          })
        }
        throw error
      })

    return await this.admin.auth().createCustomToken(uid)
  }

  /**
   * Script for redirection when user refuse sign-up
   */
  private signInRefusedTemplate(): string {
    return `
      <script>
        window.location.href = '${this.appHost}'
      </script>`
  }
}
