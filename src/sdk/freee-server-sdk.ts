/**
 * @fileoverview sdk for freee api in server side
 */
import axios from 'axios'
import { FreeeAPIClient } from './api/freee-api-client'
import { FreeeFirebaseAuthClient } from './auth/freee-firebase-auth-client'
import { SDKConfig } from './const/types'
import { ConfigManager } from './services/config-manager'
import { FreeeCryptor } from './services/freee-cryptor'
import { TokenManager } from './services/token-manager'
import * as admin from 'firebase-admin'
import { app, credential } from 'firebase-admin'
import { AuthorizationCode, ModuleOptions } from 'simple-oauth2'

export class FreeeServerSDK {
  readonly firebaseAdminApp: app.App
  readonly apiClient: FreeeAPIClient
  readonly firebaseAuthClient: FreeeFirebaseAuthClient

  /**
   * @param serviceAccount Cloud Run、App Engine、Cloud Functions などの Google 環境で実行されるアプリケーションではnullを指定することを強くおすすめします。
   *                       https://firebase.google.com/docs/admin/setup?hl=ja#initialize-sdk
   */
  constructor(
    config: SDKConfig,
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
    const cryptoKey = ConfigManager.getFirebaseConfig(config, 'cryptoKey')
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

    axios.defaults.baseURL = ConfigManager.getFreeeConfig(config, 'apiHost')

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
        id: ConfigManager.config.freee.client_id,
        secret: ConfigManager.config.freee.client_secret,
      },
      auth: {
        tokenHost: ConfigManager.getFreeeConfig(config, 'tokenHost'),
        authorizePath: ConfigManager.getFreeeConfig(config, 'authorizePath'),
        tokenPath: ConfigManager.getFreeeConfig(config, 'tokenPath'),
      },
    } satisfies ModuleOptions
  }
}
