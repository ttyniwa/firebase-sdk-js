"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreeeCryptor = void 0;
const crypto = require("crypto");
const ALGORITHM = 'aes-256-cbc';
const OUT = 'base64';
const IN = 'utf8';
const IV_LENGTH = 16;
class FreeeCryptor {
    constructor(cryptoKey) {
        this.cryptoKey = cryptoKey;
    }
    /**
     * Encrypt freee token
     */
    async encrypt(token) {
        const { accessToken, refreshToken } = token;
        const iv = crypto.randomBytes(IV_LENGTH);
        return Object.assign(Object.assign({}, token), { accessToken: this.crypt(accessToken, crypto.createCipheriv(ALGORITHM, this.cryptoKey, iv), IN, OUT), refreshToken: this.crypt(refreshToken, crypto.createCipheriv(ALGORITHM, this.cryptoKey, iv), IN, OUT), algorithm: ALGORITHM, iv });
    }
    /**
     * Decrypt freee token
     */
    async decrypt(token) {
        const { accessToken, refreshToken, algorithm, iv } = token;
        return Object.assign(Object.assign({}, token), { accessToken: this.crypt(accessToken, crypto.createDecipheriv(algorithm, this.cryptoKey, iv), OUT, IN), refreshToken: this.crypt(refreshToken, crypto.createDecipheriv(algorithm, this.cryptoKey, iv), OUT, IN) });
    }
    crypt(targetStr, algorithm, inputEncoding, outputEncoding) {
        let result = algorithm.update(targetStr, inputEncoding, outputEncoding);
        result += algorithm.final(outputEncoding);
        return result;
    }
}
exports.FreeeCryptor = FreeeCryptor;
//# sourceMappingURL=freee-cryptor.js.map