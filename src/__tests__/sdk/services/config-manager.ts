const PROJECT_ID = 'test-project-id'
const REGION_US = 'us-central1'
const MODE = 'production'
process.env.FIREBASE_CONFIG = JSON.stringify({
  projectId: PROJECT_ID,
})
process.env.ENV_REGION = REGION_US

const mockGetMode = jest.fn().mockReturnValue(MODE)
const mockGetRegion = jest.fn().mockReturnValue(REGION_US)

jest.mock('firebase-functions', () => {
  return {
    config: () => ({
      env: {
        mode: mockGetMode(),
        region: mockGetRegion(),
      },
    }),
    SUPPORTED_REGIONS: ['us-central1', 'asia-northeast1'],
  }
})

import { ConfigManager } from '../../../sdk/services/config-manager'

beforeAll(() => {
  console.log('call before all')
})

describe('ConfigManager', () => {
  describe('getFirebaseConfig', () => {
    it('return default value if config is null or does not have key', () => {
      expect(
        ConfigManager.getFirebaseConfig(null, 'cryptoKeyBucket'),
      ).toStrictEqual(`${PROJECT_ID}.appspot.com`)
      expect(
        ConfigManager.getFirebaseConfig({}, 'cryptoKeyBucket'),
      ).toStrictEqual(`${PROJECT_ID}.appspot.com`)
    })
    it('return config value if config is not null and has key', () =>
      expect(
        ConfigManager.getFirebaseConfig(
          { firebase: { cryptoKeyBucket: 'cryptoKeyBucket' } },
          'cryptoKeyBucket',
        ),
      ).toStrictEqual('cryptoKeyBucket'))
  })

  describe('getFreeeConfig', () => {
    it('return default value if config is null or does not have key', () => {
      expect(ConfigManager.getFreeeConfig(null, 'apiHost')).toStrictEqual(
        'https://api.freee.co.jp',
      )
      expect(ConfigManager.getFreeeConfig({}, 'apiHost')).toStrictEqual(
        'https://api.freee.co.jp',
      )
    })
    it('return production value if config is null or does not have key', () => {
      expect(ConfigManager.getFreeeConfig(null, 'appHost')).toStrictEqual(
        `https://${PROJECT_ID}.web.app`,
      )
    })
    it('return config value if config is not null and has key', () =>
      expect(
        ConfigManager.getFreeeConfig(
          { freee: { apiHost: 'https://localhost' } },
          'apiHost',
        ),
      ).toStrictEqual('https://localhost'))
  })
})
