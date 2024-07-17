import { AxiosStatic } from 'axios';
import * as firebaseAdmin from 'firebase-admin';
import { Response } from 'firebase-functions';
import { SDKConfig } from '../const/types';
import { TokenManager } from '../services/token-manager';
import { AuthorizationCode } from 'simple-oauth2';
export declare class FreeeFirebaseAuthClient {
    private readonly admin;
    private readonly authorizationCode;
    private readonly axios;
    private readonly tokenManager;
    readonly redirectPath: string;
    readonly callbackPath: string;
    readonly companiesPath: string;
    private readonly homePath;
    private readonly appHost;
    private readonly authHost;
    constructor(admin: firebaseAdmin.app.App, authorizationCode: AuthorizationCode, axios: AxiosStatic, tokenManager: TokenManager, config: SDKConfig);
    /**
     * Redirect screen to authorize
     */
    redirect(res: Response): void;
    /**
     * Get token, save it to firebase and login firebase
     */
    callback(code: string, res: Response): Promise<void>;
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
