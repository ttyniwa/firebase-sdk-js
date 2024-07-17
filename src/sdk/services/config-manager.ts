import * as functions from 'firebase-functions'
import { SDKConfig, SDKFirebaseConfig, SDKFreeeConfig } from '../const/types'
import { config as loadEnv } from 'dotenv'

loadEnv()

type SupportedRegions = (typeof functions.SUPPORTED_REGIONS)[number]
const adminConfig = JSON.parse(process.env.FIREBASE_CONFIG!)
const projectId = adminConfig.projectId
const region: SupportedRegions =
  process.env.ENV_REGION &&
  (functions.SUPPORTED_REGIONS as readonly string[]).includes(
    process.env.ENV_REGION,
  )
    ? (process.env.ENV_REGION as SupportedRegions)
    : 'asia-northeast1'

type FirebaseConfigKeys = keyof SDKFirebaseConfig
type FreeeConfigKeys = keyof SDKFreeeConfig

interface FirebaseFunctionsConfigs {
  env: {
    mode: 'production' | string
    region: SupportedRegions
  }
  freee: {
    client_id: string
    client_secret: string
  }
}

const DEFAULT_SDK_CONFIG = {
  freee: {
    apiHost: 'https://api.freee.co.jp',
    appHost: 'http://localhost:5000',
    authHost: `http://localhost:5001/${projectId}/${region}/api/auth`,
    redirectPath: '/redirect',
    callbackPath: '/callback',
    companiesPath: '/companies',
    homePath: '/',
    tokenHost: 'https://accounts.secure.freee.co.jp',
    authorizePath: '/public_api/authorize',
    tokenPath: '/public_api/token',
  } satisfies Required<SDKFreeeConfig>,
} satisfies Partial<SDKConfig>

const PRODUCTION_SDK_CONFIG: Partial<SDKConfig> = {
  freee: {
    appHost: `https://${projectId}.web.app`,
    authHost: `https://${region}-${projectId}.cloudfunctions.net/api/auth`,
    tokenHost: 'https://accounts.secure.freee.co.jp',
  },
}

export class ConfigManager {
  static getFirebaseConfig(sdkConfig: SDKConfig, key: FirebaseConfigKeys) {
    return sdkConfig?.firebase?.[key]
  }

  static getFreeeConfig(sdkConfig: SDKConfig, key: FreeeConfigKeys) {
    return (
      sdkConfig?.freee?.[key] ??
      (this.isProduction ? PRODUCTION_SDK_CONFIG.freee?.[key] : undefined) ??
      DEFAULT_SDK_CONFIG.freee[key]
    )
  }

  static get config(): FirebaseFunctionsConfigs {
    return {
      env: {
        mode: process.env.ENV_MODE || 'production',
        region,
      },
      freee: {
        client_id: process.env.FREEE_CLIENT_ID || '',
        client_secret: process.env.FREEE_CLIENT_SECRET || '',
      },
    }
  }

  private static get isProduction() {
    return this.config.env.mode === 'production'
  }
}
