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

import { ConfigManager } from './config-manager'

beforeAll(() => {
  console.log('call before all')
})

describe('ConfigManager', () => {
  describe('getFirebaseConfig', () => {
    it('return default value if config does not have key', () => {
      expect(
        ConfigManager.getFirebaseConfig(
          { firebase: { cryptoKey: '' } },
          'apiKey',
        ),
      ).toStrictEqual(undefined)
    })
    it('return config value if config has key', () =>
      expect(
        ConfigManager.getFirebaseConfig(
          { firebase: { cryptoKey: 'cryptoKey' } },
          'cryptoKey',
        ),
      ).toStrictEqual('cryptoKey'))
  })

  describe('getFreeeConfig', () => {
    it('return default value if config does not have key', () => {
      expect(
        ConfigManager.getFreeeConfig(
          { firebase: { cryptoKey: '' } },
          'apiHost',
        ),
      ).toStrictEqual('https://api.freee.co.jp')
    })
    it('return production value if config does not have key', () => {
      expect(
        ConfigManager.getFreeeConfig(
          { firebase: { cryptoKey: '' } },
          'appHost',
        ),
      ).toStrictEqual(`https://${PROJECT_ID}.web.app`)
    })
    it('return config value if config has key', () =>
      expect(
        ConfigManager.getFreeeConfig(
          {
            freee: { apiHost: 'https://localhost' },
            firebase: { cryptoKey: '' },
          },
          'apiHost',
        ),
      ).toStrictEqual('https://localhost'))
  })
})
