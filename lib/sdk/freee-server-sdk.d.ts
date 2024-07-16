import { FreeeAPIClient } from './api/freee-api-client';
import { FreeeFirebaseAuthClient } from './auth/freee-firebase-auth-client';
import { SDKConfig } from './const/types';
import { app } from 'firebase-admin';
export declare class FreeeServerSDK {
    readonly firebaseAdminApp: app.App;
    readonly apiClient: FreeeAPIClient;
    readonly firebaseAuthClient: FreeeFirebaseAuthClient;
    /**
     * @param serviceAccount Cloud Run、App Engine、Cloud Functions などの Google 環境で実行されるアプリケーションではnullを指定することを強くおすすめします。
     *                       https://firebase.google.com/docs/admin/setup?hl=ja#initialize-sdk
     */
    constructor(config: SDKConfig, serviceAccount: {
        [key: string]: string;
    } | null);
    private getCredentials;
}
