import { FreeeAPIClient } from './api/freee-api-client';
import { FreeeFirebaseAuthClient } from './auth/freee-firebase-auth-client';
import { SDKConfig } from './const/types';
import { ServiceAccount } from 'firebase-admin';
import { App } from 'firebase-admin/app';
export declare class FreeeServerSDK {
    private firebaseAdminApp;
    private apiClient;
    private firebaseAuthClient;
    /**
     *
     * @param config
     * @param serviceAccount Cloud Run、App Engine、Cloud Functions などの Google 環境で実行されるアプリケーションではnullを指定することを強くおすすめします。
     *                       https://firebase.google.com/docs/admin/setup?hl=ja#initialize-sdk
     */
    constructor(config: SDKConfig, serviceAccount: ServiceAccount | null);
    firebaseApp(): App;
    api(): FreeeAPIClient;
    auth(): FreeeFirebaseAuthClient;
    private getCredentials;
}
