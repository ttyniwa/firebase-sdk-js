import { AxiosStatic } from 'axios'
import * as firebaseAdmin from 'firebase-admin'
import { Response } from 'firebase-functions'
import { FreeeToken } from '../const/types'
import { TokenManager } from '../services/token-manager'
import { AuthorizationCode } from 'simple-oauth2'
import { SDKConfig } from '../services/create-sdk-config'

export class FreeeFirebaseAuthClient {
  readonly redirectPath: string
  readonly callbackPath: string
  readonly companiesPath: string
  private readonly homePath: string
  private readonly appHost: string
  private readonly authHost: string

  constructor(
    private readonly admin: firebaseAdmin.app.App,
    private readonly authorizationCode: AuthorizationCode,
    private readonly axios: AxiosStatic,
    private readonly tokenManager: TokenManager,
    config: Required<SDKConfig>,
  ) {
    // path setting
    this.redirectPath = config.redirectPath
    this.callbackPath = config.callbackPath
    this.companiesPath = config.companiesPath
    this.homePath = config.homePath
    this.appHost = config.appHost
    this.authHost = config.authHost
  }

  /**
   * Redirect screen to authorize
   */
  redirect(res: Response): void {
    const redirectUri = this.authorizationCode.authorizeURL({
      redirect_uri: `${this.authHost}${this.callbackPath}`,
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
        redirect_uri: `${this.authHost}${this.callbackPath}`,
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
