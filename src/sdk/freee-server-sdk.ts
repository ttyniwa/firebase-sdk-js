/**
 * @fileoverview sdk for freee api in server side
 */
import axios from 'axios'
import * as admin from 'firebase-admin'
import { FreeeAPIClient } from './api/freee-api-client'
import { FreeeFirebaseAuthClient } from './auth/freee-firebase-auth-client'
import { SDKConfig } from './const/types'
import { ConfigManager } from './services/config-manager'
import FreeeCryptor from './services/freee-cryptor'
import { TokenManager } from './services/token-manager'

class FreeeServerSDK {
  private admin: admin.app.App
  private apiClient: FreeeAPIClient
  private firebaseAuthClient: FreeeFirebaseAuthClient

  constructor(
    config: SDKConfig,
    serviceAccount: { [key: string]: string } | null,
  ) {
    // Set up firebase admin
    if (serviceAccount) {
      // for local
      this.admin = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
        storageBucket: `${serviceAccount.project_id}.appspot.com`,
      })
    } else {
      // Firebase setup by ADC
      this.admin = admin.initializeApp()
    }

    // Set up cryptor for freee token
    const cryptoKeyBucket = ConfigManager.getFirebaseConfig(
      config,
      'cryptoKeyBucket',
    )
    const cryptor = cryptoKeyBucket
      ? new FreeeCryptor(this.admin.storage().bucket(cryptoKeyBucket))
      : null

    // Set up oauth2 client
    const oauth2 = require('simple-oauth2').create(this.getCredentials(config))
    const tokenManager = new TokenManager(this.admin, oauth2, cryptor)

    axios.defaults.baseURL = ConfigManager.getFreeeConfig(config, 'apiHost')

    this.apiClient = new FreeeAPIClient(tokenManager, axios)
    this.firebaseAuthClient = new FreeeFirebaseAuthClient(
      this.admin,
      oauth2,
      axios,
      tokenManager,
      config,
    )
  }

  /**
   * get firebase admin instance
   */
  firebaseApp(): admin.app.App {
    return this.admin
  }

  /**
   * get firebase admin instance
   */
  api(): FreeeAPIClient {
    return this.apiClient
  }

  /**
   * get firebase admin instance
   */
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

export default FreeeServerSDK
