import { FreeeCryptor } from './freee-cryptor'
import * as crypto from 'crypto'

describe('FreeeCryptor', () => {
  describe('encrypt', () => {
    it('can encrypt', async () => {
      const cryptor = new FreeeCryptor(crypto.randomBytes(32))
      expect(
        await cryptor.encrypt({
          accessToken: 'accessToken',
          refreshToken: 'refreshToken',
          expiresIn: 100,
          createdAt: 100,
        }),
      ).toEqual(
        expect.objectContaining({
          expiresIn: 100,
          createdAt: 100,
          algorithm: 'aes-256-cbc',
        }),
      )
    })
  })

  describe('decrypt', () => {
    it('can decrypt', async () => {
      const cryptor = new FreeeCryptor(crypto.randomBytes(32))
      const encrypted = await cryptor.encrypt({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
        expiresIn: 100,
        createdAt: 100,
      })

      expect(await cryptor.decrypt(encrypted)).toEqual(
        expect.objectContaining({
          accessToken: 'accessToken',
          refreshToken: 'refreshToken',
          expiresIn: 100,
          createdAt: 100,
        }),
      )
    })
  })
})
