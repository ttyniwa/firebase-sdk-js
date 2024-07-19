/**
 * @fileoverview sdk for freee api in server side
 */
import axios from 'axios'
import { FreeeAPIClient } from './api/freee-api-client'
import { FreeeFirebaseAuthClient } from './auth/freee-firebase-auth-client'
import { FreeeCryptor } from './services/freee-cryptor'
import { TokenManager } from './services/token-manager'
import * as admin from 'firebase-admin'
import { app, credential } from 'firebase-admin'
import { AuthorizationCode, ModuleOptions } from 'simple-oauth2'
import { SDKConfig } from './services/create-sdk-config'

export class FreeeServerSDK {
  readonly firebaseAdminApp: app.App
  readonly apiClient: FreeeAPIClient
  readonly firebaseAuthClient: FreeeFirebaseAuthClient

  /**
   * @param serviceAccount Cloud Run、App Engine、Cloud Functions などの Google 環境で実行されるアプリケーションではnullを指定することを強くおすすめします。
   *                       https://firebase.google.com/docs/admin/setup?hl=ja#initialize-sdk
   */
  constructor(
    config: Required<SDKConfig>,
    serviceAccount: { [key: string]: string } | null,
  ) {
    // Set up firebase-admin
    if (serviceAccount) {
      // for local
      this.firebaseAdminApp = admin.initializeApp({
        credential: credential.cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
      })
    } else {
      // Firebase setup by ADC
      this.firebaseAdminApp = admin.initializeApp()
    }

    // Set up cryptor for freee token
    const cryptoKey = config.cryptoKey
    if (cryptoKey == null) {
      throw new Error('cryptoKey must provided.')
    }
    const cryptor = new FreeeCryptor(Buffer.from(cryptoKey, 'hex'))

    // Set up oauth2 client
    const authorizationCode = new AuthorizationCode(this.getCredentials(config))
    const tokenManager = new TokenManager(
      this.firebaseAdminApp,
      authorizationCode,
      cryptor,
    )

    axios.defaults.baseURL = config.apiHost

    this.apiClient = new FreeeAPIClient(tokenManager, axios)
    this.firebaseAuthClient = new FreeeFirebaseAuthClient(
      this.firebaseAdminApp,
      authorizationCode,
      axios,
      tokenManager,
      config,
    )
  }

  private getCredentials(config: SDKConfig) {
    return {
      client: {
        id: config.clientId,
        secret: config.clientSecret,
      },
      auth: {
        tokenHost: config.tokenHost!,
        authorizePath: config.authorizePath,
        tokenPath: config.tokenPath,
      },
    } satisfies ModuleOptions
  }
}
