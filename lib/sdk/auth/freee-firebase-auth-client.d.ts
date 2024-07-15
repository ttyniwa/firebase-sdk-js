import { AxiosStatic } from 'axios';
import * as firebaseAdmin from 'firebase-admin';
import { Response } from 'firebase-functions';
import { SDKConfig } from '../const/types';
import { TokenManager } from '../services/token-manager';
export declare class FreeeFirebaseAuthClient {
    private admin;
    private oauth2;
    private axios;
    private tokenManager;
    private clientId;
    private clientSecret;
    private redirectPath;
    private callbackPath;
    private companiesPath;
    private homePath;
    private appHost;
    private authHost;
    private apiKey?;
    constructor(admin: firebaseAdmin.app.App, oauth2: any, axios: AxiosStatic, tokenManager: TokenManager, config: SDKConfig);
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
