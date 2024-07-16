"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreeeCryptor = void 0;
const date_fns_1 = require("date-fns");
const crypto = require("crypto");
const ALGORITHM = 'aes-256-cbc';
const OUT = 'base64';
const IN = 'utf8';
const IV_LENGTH = 16;
class FreeeCryptor {
    constructor(bucket) {
        this.bucket = bucket;
        this.keyCache = {};
    }
    /**
     * Create crypto key to bucket for it by specified date
     */
    async createCryptoKey(date) {
        const keyFileName = (0, date_fns_1.format)(date, 'yyyyMM');
        return this.create(keyFileName);
    }
    /**
     * Encrypt freee token
     *
     * @param {Object} token
     * @param {string} token.accessToken
     * @param {string} token.refreshToken
     *
     * @return {Promise<Object>} - encrypted freee token object
     */
    async encrypt(token) {
        const { accessToken, refreshToken } = token;
        const keyFileName = (0, date_fns_1.format)(new Date(), 'yyyyMM');
        const key = await this.getKey(keyFileName);
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        return Object.assign(Object.assign({}, token), { accessToken: this.crypt(accessToken, cipher, IN, OUT), refreshToken: this.crypt(refreshToken, cipher, IN, OUT), keyFileName, algorithm: ALGORITHM, iv });
    }
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
    async decrypt(token) {
        const { accessToken, refreshToken, keyFileName, algorithm, iv } = token;
        const key = await this.getKey(keyFileName);
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        return Object.assign(Object.assign({}, token), { accessToken: this.crypt(accessToken, decipher, OUT, IN), refreshToken: this.crypt(refreshToken, decipher, OUT, IN) });
    }
    async getKey(keyFileName) {
        if (this.keyCache[keyFileName]) {
            return this.keyCache[keyFileName];
        }
        try {
            return await this.get(keyFileName);
        }
        catch (error) {
            if (!(await this.exists(keyFileName))) {
                console.info('No key file for:', keyFileName);
                await this.create(keyFileName);
            }
            return await this.get(keyFileName);
        }
    }
    crypt(targetStr, algorithm, inputEncoding, outputEncoding) {
        let result = algorithm.update(targetStr, inputEncoding, outputEncoding);
        result += algorithm.final(outputEncoding);
        return result;
    }
    async create(keyFileName) {
        const encryptionKey = crypto.randomBytes(32);
        const keyFile = this.bucket.file(keyFileName);
        await keyFile.save(encryptionKey);
        console.log('New crypto key is successfully created for:', keyFileName);
    }
    async get(keyFileName) {
        const response = await this.bucket.file(keyFileName).download();
        this.keyCache[keyFileName] = response[0];
        console.log('Crypto key is retrieved from storage for:', keyFileName);
        return response[0];
    }
    async exists(keyFileName) {
        const response = await this.bucket.file(keyFileName).exists();
        const isExists = response[0];
        console.log(`Crypto key ${isExists ? 'is' : 'is not'} exists storage for:`, keyFileName);
        return isExists;
    }
}
exports.FreeeCryptor = FreeeCryptor;
//# sourceMappingURL=freee-cryptor.js.map