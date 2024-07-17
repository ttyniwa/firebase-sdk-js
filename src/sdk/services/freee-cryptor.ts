import { Cipher, Decipher } from 'crypto'
import { FreeeToken } from '../const/types'
import * as crypto from 'crypto'

const ALGORITHM = 'aes-256-cbc'
const OUT = 'base64'
const IN = 'utf8'
const IV_LENGTH = 16

export interface FreeeTokenWithCryptInfo extends FreeeToken {
  algorithm: string
  iv: Buffer
}

export class FreeeCryptor {
  constructor(private readonly cryptoKey: Buffer) {}

  /**
   * Encrypt freee token
   */
  async encrypt(token: FreeeToken): Promise<FreeeTokenWithCryptInfo> {
    const { accessToken, refreshToken } = token
    const iv = crypto.randomBytes(IV_LENGTH)

    return {
      ...token,
      accessToken: this.crypt(
        accessToken,
        crypto.createCipheriv(ALGORITHM, this.cryptoKey, iv),
        IN,
        OUT,
      ),
      refreshToken: this.crypt(
        refreshToken,
        crypto.createCipheriv(ALGORITHM, this.cryptoKey, iv),
        IN,
        OUT,
      ),
      algorithm: ALGORITHM,
      iv,
    }
  }

  /**
   * Decrypt freee token
   */
  async decrypt(
    token: FreeeTokenWithCryptInfo,
  ): Promise<FreeeTokenWithCryptInfo> {
    const { accessToken, refreshToken, algorithm, iv } = token

    return {
      ...token,
      accessToken: this.crypt(
        accessToken,
        crypto.createDecipheriv(algorithm, this.cryptoKey, iv),
        OUT,
        IN,
      ),
      refreshToken: this.crypt(
        refreshToken,
        crypto.createDecipheriv(algorithm, this.cryptoKey, iv),
        OUT,
        IN,
      ),
    }
  }

  private crypt(
    targetStr: string,
    algorithm: Cipher | Decipher,
    inputEncoding: crypto.Encoding | undefined,
    outputEncoding: crypto.Encoding,
  ) {
    let result = algorithm.update(targetStr, inputEncoding, outputEncoding)
    result += algorithm.final(outputEncoding)
    return result
  }
}
