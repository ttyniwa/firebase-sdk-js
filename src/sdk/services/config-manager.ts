import * as functions from 'firebase-functions'
import { SDKBaseConfig } from '../const/types'
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

export enum ConfigKeys {
  apiHost = 'apiHost',
  appHost = 'appHost',
  authHost = 'authHost',
  redirectPath = 'redirectPath',
  callbackPath = 'callbackPath',
  companiesPath = 'companiesPath',
  homePath = 'homePath',
  tokenHost = 'tokenHost',
  authorizePath = 'authorizePath',
  tokenPath = 'tokenPath',
  cryptoKeyBucket = 'cryptoKeyBucket',
}

interface FirebaseFunctionsConfigs {
  env: {
    mode: 'production' | string
    region: SupportedRegions | string
  }
  freee: {
    client_id: string
    client_secret: string
  }
}

interface DefaultConfig {
  key: ConfigKeys
  default: string
  production?: string
}

interface DefaltConfigs {
  freee: DefaultConfig[]
  firebase: DefaultConfig[]
}

/**
 * Default value definitions for {@link SDKFreeeConfig}
 *
 * @see {SDKFreeeConfig}
 */
const DEFAULT_CONFIGS: DefaltConfigs = {
  freee: [
    {
      key: ConfigKeys.apiHost,
      default: 'https://api.freee.co.jp',
      production: 'https://api.freee.co.jp',
    },
    {
      key: ConfigKeys.appHost,
      default: 'http://localhost:5000',
      production: `https://${projectId}.web.app`,
    },
    {
      key: ConfigKeys.authHost,
      default: `http://localhost:5001/${projectId}/${region}/api/auth`,
      production: `https://${region}-${projectId}.cloudfunctions.net/api/auth`,
    },
    {
      key: ConfigKeys.redirectPath,
      default: '/redirect',
    },
    {
      key: ConfigKeys.callbackPath,
      default: '/callback',
    },
    {
      key: ConfigKeys.companiesPath,
      default: '/companies',
    },
    {
      key: ConfigKeys.homePath,
      default: '/',
    },
    {
      key: ConfigKeys.tokenHost,
      default: 'https://accounts.secure.freee.co.jp',
      production: 'https://accounts.secure.freee.co.jp',
    },
    {
      key: ConfigKeys.authorizePath,
      default: '/public_api/authorize',
    },
    {
      key: ConfigKeys.tokenPath,
      default: '/public_api/token',
    },
  ],
  firebase: [
    {
      key: ConfigKeys.cryptoKeyBucket,
      default: `${projectId}.appspot.com`,
    },
  ],
}

export class ConfigManager {
  static get(configs: SDKBaseConfig | null, key: ConfigKeys) {
    return configs?.[key] ?? this.getDefaultValue(key)
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

  private static getDefaultValue(key: ConfigKeys) {
    const defaultConfigs = ([] as DefaultConfig[])
      .concat(DEFAULT_CONFIGS.freee)
      .concat(DEFAULT_CONFIGS.firebase)
    const config = defaultConfigs.find(
      (defaultConfig) => defaultConfig.key === key,
    )!
    return this.isProduction && config.production
      ? config.production
      : config.default
  }

  private static get isProduction() {
    return this.config.env.mode === 'production'
  }
}
