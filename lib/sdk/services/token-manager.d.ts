import * as firebaseAdmin from 'firebase-admin';
import { FreeeToken } from '../const/types';
import { FreeeCryptor } from './freee-cryptor';
import { AuthorizationCode } from 'simple-oauth2';
export declare class TokenManager {
    private admin;
    private authorizationCode;
    private cryptor;
    private tokenCache;
    constructor(admin: firebaseAdmin.app.App, authorizationCode: AuthorizationCode, cryptor: FreeeCryptor | null);
    /**
     * Get token with handling refresh token
     */
    get(userId: string): Promise<string>;
    /**
     * Get token with handling refresh token
     */
    save(userId: string, email: string, freeeToken: FreeeToken): Promise<void>;
    createCryptoKey(date: Date): Promise<void>;
    private refreshToken;
    private tokenExpired;
    private getTokenFromFirebase;
    private encrypt;
    private decrypt;
}
