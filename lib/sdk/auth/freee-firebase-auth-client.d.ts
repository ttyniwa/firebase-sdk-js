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
    readonly redirectPath: string;
    readonly callbackPath: string;
    readonly companiesPath: string;
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
