"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreeeServerSDK = void 0;
/**
 * @fileoverview sdk for freee api in server side
 */
const axios_1 = require("axios");
const freee_api_client_1 = require("./api/freee-api-client");
const freee_firebase_auth_client_1 = require("./auth/freee-firebase-auth-client");
const freee_cryptor_1 = require("./services/freee-cryptor");
const token_manager_1 = require("./services/token-manager");
const admin = require("firebase-admin");
const firebase_admin_1 = require("firebase-admin");
const simple_oauth2_1 = require("simple-oauth2");
class FreeeServerSDK {
    /**
     * @param serviceAccount Cloud Run、App Engine、Cloud Functions などの Google 環境で実行されるアプリケーションではnullを指定することを強くおすすめします。
     *                       https://firebase.google.com/docs/admin/setup?hl=ja#initialize-sdk
     */
    constructor(config, serviceAccount) {
        // Set up firebase-admin
        if (serviceAccount) {
            // for local
            this.firebaseAdminApp = admin.initializeApp({
                credential: firebase_admin_1.credential.cert(serviceAccount),
                databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
            });
        }
        else {
            // Firebase setup by ADC
            this.firebaseAdminApp = admin.initializeApp();
        }
        // Set up cryptor for freee token
        const cryptoKey = config.cryptoKey;
        if (cryptoKey == null) {
            throw new Error('cryptoKey must provided.');
        }
        const cryptor = new freee_cryptor_1.FreeeCryptor(Buffer.from(cryptoKey, 'hex'));
        // Set up oauth2 client
        const authorizationCode = new simple_oauth2_1.AuthorizationCode(this.getCredentials(config));
        const tokenManager = new token_manager_1.TokenManager(this.firebaseAdminApp, authorizationCode, cryptor);
        axios_1.default.defaults.baseURL = config.apiHost;
        this.apiClient = new freee_api_client_1.FreeeAPIClient(tokenManager, axios_1.default);
        this.firebaseAuthClient = new freee_firebase_auth_client_1.FreeeFirebaseAuthClient(this.firebaseAdminApp, authorizationCode, axios_1.default, tokenManager, config);
    }
    getCredentials(config) {
        return {
            client: {
                id: config.clientId,
                secret: config.clientSecret,
            },
            auth: {
                tokenHost: config.tokenHost,
                authorizePath: config.authorizePath,
                tokenPath: config.tokenPath,
            },
        };
    }
}
exports.FreeeServerSDK = FreeeServerSDK;
//# sourceMappingURL=freee-server-sdk.js.map