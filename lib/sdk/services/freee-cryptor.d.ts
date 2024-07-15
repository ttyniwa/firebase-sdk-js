import { Bucket } from '@google-cloud/storage';
import { FreeeToken } from '../const/types';
export interface FreeeTokenWithCryptInfo extends FreeeToken {
    keyFileName: string;
    algorithm: string;
    iv: Buffer;
}
export declare class FreeeCryptor {
    private bucket;
    private keyCache;
    constructor(bucket: Bucket);
    /**
     * Create crypto key to bucket for it by specified date
     */
    createCryptoKey(date: Date): Promise<void>;
    /**
     * Encrypt freee token
     *
     * @param {Object} token
     * @param {string} token.accessToken
     * @param {string} token.refreshToken
     *
     * @return {Promise<Object>} - encrypted freee token object
     */
    encrypt(token: FreeeToken): Promise<FreeeTokenWithCryptInfo>;
    /**
     * Decrypt freee token
     *
     * @param {Object} token
     * @param {string} token.accessToken
     * @param {string} token.refreshToken
     * @param {string} token.keyFileName
     * @param {string} token.algorithm
     * @param {Buffer} token.iv
     *
     * @return {Promise<Object>} - decrypted freee token object
     */
    decrypt(token: FreeeTokenWithCryptInfo): Promise<FreeeTokenWithCryptInfo>;
    private cipher;
    private decipher;
    private getKey;
    private crypt;
    private create;
    private get;
    private exists;
}
