import { FreeeAPIClient } from './api/freee-api-client';
import { FreeeFirebaseAuthClient } from './auth/freee-firebase-auth-client';
import { app } from 'firebase-admin';
import { SDKConfig } from './services/create-sdk-config';
export declare class FreeeServerSDK {
    readonly firebaseAdminApp: app.App;
    readonly apiClient: FreeeAPIClient;
    readonly firebaseAuthClient: FreeeFirebaseAuthClient;
    /**
     * @param serviceAccount Cloud Run、App Engine、Cloud Functions などの Google 環境で実行されるアプリケーションではnullを指定することを強くおすすめします。
     *                       https://firebase.google.com/docs/admin/setup?hl=ja#initialize-sdk
     */
    constructor(config: Required<SDKConfig>, serviceAccount: {
        [key: string]: string;
    } | null);
    private getCredentials;
}
