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
import { app, credential, initializeApp } from 'firebase-admin'
import { App } from 'firebase-admin/app'

export class FreeeServerSDK {
  private firebaseAdminApp: app.App
  private apiClient: FreeeAPIClient
  private firebaseAuthClient: FreeeFirebaseAuthClient

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
      this.firebaseAdminApp = initializeApp({
        credential: credential.cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
        storageBucket: `${serviceAccount.project_id}.appspot.com`,
      })
    } else {
      // Firebase setup by ADC
      this.firebaseAdminApp = initializeApp()
    }

    // Set up cryptor for freee token
    const cryptoKeyBucket = ConfigManager.getFirebaseConfig(
      config,
      'cryptoKeyBucket',
    )
    const cryptor = cryptoKeyBucket
      ? new FreeeCryptor(
          this.firebaseAdminApp.storage().bucket(cryptoKeyBucket),
        )
      : null

    // Set up oauth2 client
    const oauth2 = require('simple-oauth2').create(this.getCredentials(config))
    const tokenManager = new TokenManager(
      this.firebaseAdminApp,
      oauth2,
      cryptor,
    )

    axios.defaults.baseURL = ConfigManager.getFreeeConfig(config, 'apiHost')

    this.apiClient = new FreeeAPIClient(tokenManager, axios)
    this.firebaseAuthClient = new FreeeFirebaseAuthClient(
      this.firebaseAdminApp,
      oauth2,
      axios,
      tokenManager,
      config,
    )
  }

  firebaseApp(): App {
    return this.firebaseAdminApp
  }

  api(): FreeeAPIClient {
    return this.apiClient
  }

  auth(): FreeeFirebaseAuthClient {
    return this.firebaseAuthClient
  }

  private getCredentials(config: SDKConfig) {
    const credentials = {
      client: {
        id: ConfigManager.config.freee.client_id,
        secret: ConfigManager.config.freee.client_secret,
      },
      auth: {
        tokenHost: ConfigManager.getFreeeConfig(config, 'tokenHost'),
        authorizePath: ConfigManager.getFreeeConfig(config, 'authorizePath'),
        tokenPath: ConfigManager.getFreeeConfig(config, 'tokenPath'),
      },
    }

    return credentials
  }
}
