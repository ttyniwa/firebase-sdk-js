import { FreeeToken } from '../const/types';
export interface FreeeTokenWithCryptInfo extends FreeeToken {
    algorithm: string;
    iv: Buffer;
}
export declare class FreeeCryptor {
    private readonly cryptoKey;
    constructor(cryptoKey: Buffer);
    /**
     * Encrypt freee token
     */
    encrypt(token: FreeeToken): Promise<FreeeTokenWithCryptInfo>;
    /**
     * Decrypt freee token
     */
    decrypt(token: FreeeTokenWithCryptInfo): Promise<FreeeTokenWithCryptInfo>;
    private crypt;
}
