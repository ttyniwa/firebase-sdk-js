import { AxiosStatic } from 'axios';
import * as firebaseAdmin from 'firebase-admin';
import { Response } from 'firebase-functions';
import { SDKConfig } from '../const/types';
import { TokenManager } from '../services/token-manager';
import { AuthorizationCode } from 'simple-oauth2';
export declare class FreeeFirebaseAuthClient {
    private admin;
    private authorizationCode;
    private axios;
    private tokenManager;
    private redirectPath;
    private callbackPath;
    private companiesPath;
    private homePath;
    private appHost;
    private authHost;
    constructor(admin: firebaseAdmin.app.App, authorizationCode: AuthorizationCode, axios: AxiosStatic, tokenManager: TokenManager, config: SDKConfig);
    /**
     * Redirect screen to authorize
     */
    redirect(res: Response): void;
    /**
     * Get token, save it to firebase and login firebase
     */
    callback(code: string, res: Response): Promise<void>;
    /**
     * path for redirect on freee authorization
     */
    getRedirectPath(): string;
    /**
     * path for callback on freee authorization
     */
    getCallbackPath(): string;
    /**
     * path for callback on freee authorization
     */
    getCompaniesPath(): string;
    /**
     * Create crypto key to bucket for it by specified date
     */
    createCryptoKey(date: Date): Promise<void>;
    private getFreeeUser;
    /**
     * create firebase account and token
     */
    private createFirebaseAccount;
    /**
     * Script for redirection when user refuse sign-up
     */
    private signInRefusedTemplate;
}
