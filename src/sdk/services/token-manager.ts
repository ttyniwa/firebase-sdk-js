import * as firebaseAdmin from 'firebase-admin'
import { FreeeToken } from '../const/types'
import { FreeeCryptor, FreeeTokenWithCryptInfo } from './freee-cryptor'
import { AuthorizationCode } from 'simple-oauth2'

const MARGIN_OF_EXPIRES_SECONDS = 300

export class TokenManager {
  private tokenCache: { [key: string]: FreeeTokenWithCryptInfo }

  constructor(
    private readonly admin: firebaseAdmin.app.App,
    private readonly authorizationCode: AuthorizationCode,
    private readonly cryptor: FreeeCryptor,
  ) {
    this.tokenCache = {}
  }

  /**
   * Get token with handling refresh token
   */
  async get(userId: string): Promise<string> {
    const freeeToken = await this.getTokenFromFirebase(userId)

    if (this.isTokenExpired(freeeToken)) {
      console.log(`accessToken has been expired for user:`, userId)

      try {
        return await this.refreshToken(freeeToken, userId)
      } catch (error) {
        if (error.output && error.output.statusCode === 401) {
          console.log('Token is already refreshed in other instance:', error)

          const newToken = await this.getTokenFromFirebase(userId, true)
          if (this.isTokenExpired(newToken)) {
            console.error('Can not get available token:', error)
            throw error
          }
          return newToken.accessToken
        } else {
          throw error
        }
      }
    } else {
      return freeeToken.accessToken
    }
  }

  /**
   * Get token with handling refresh token
   */
  async save(
    userId: string,
    email: string,
    freeeToken: FreeeToken,
  ): Promise<void> {
    const token = await this.cryptor.encrypt(freeeToken)

    // Save freee token to firestore
    await this.admin
      .firestore()
      .doc(`/freeeTokens/${userId}`)
      .set({
        ...token,
        email,
      })
  }

  private async refreshToken(
    freeeToken: FreeeTokenWithCryptInfo,
    userId: string,
  ) {
    // refresh
    const tokenObject = {
      access_token: freeeToken.accessToken,
      refresh_token: freeeToken.refreshToken,
      expires_in: freeeToken.expiresIn,
    }
    const accessToken = this.authorizationCode.createToken(tokenObject)
    const newToken = await accessToken.refresh()

    // encrypt and cache
    const token = (await this.cryptor.encrypt({
      accessToken: newToken.token.access_token as string,
      refreshToken: newToken.token.refresh_token as string,
      expiresIn: newToken.token.expires_in as number,
      createdAt: newToken.token.created_at as number,
    })) as FreeeTokenWithCryptInfo
    this.tokenCache[userId] = token

    // save token to firestore
    await this.admin
      .firestore()
      .doc(`/freeeTokens/${userId}`)
      .set({ ...token }, { merge: true })

    console.log('accessToken is successfully refreshed for user:', userId)

    return newToken.token.access_token as string
  }

  private isTokenExpired(freeeToken: FreeeTokenWithCryptInfo) {
    const expiredSeconds =
      freeeToken.createdAt + freeeToken.expiresIn - MARGIN_OF_EXPIRES_SECONDS
    const nowInSeconds = new Date().getTime() / 1000
    return nowInSeconds >= expiredSeconds
  }

  private async getTokenFromFirebase(userId: string, noCache?: boolean) {
    if (!noCache) {
      const cachedToken = this.tokenCache[userId]
      if (cachedToken) {
        return await this.cryptor.decrypt(cachedToken)
      }
    }

    const snap = await this.admin
      .firestore()
      .doc(`/freeeTokens/${userId}`)
      .get()
    const token = snap.data() as FreeeTokenWithCryptInfo
    this.tokenCache[userId] = token

    console.log('Token is retrieved from firestore for user:', userId)

    return await this.cryptor.decrypt(token)
  }
}
