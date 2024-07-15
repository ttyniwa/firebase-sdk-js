"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreeeServerSDK = void 0;
/**
 * @fileoverview sdk for freee api in server side
 */
const axios_1 = require("axios");
const freee_api_client_1 = require("./api/freee-api-client");
const freee_firebase_auth_client_1 = require("./auth/freee-firebase-auth-client");
const config_manager_1 = require("./services/config-manager");
const freee_cryptor_1 = require("./services/freee-cryptor");
const token_manager_1 = require("./services/token-manager");
const firebase_admin_1 = require("firebase-admin");
class FreeeServerSDK {
    /**
     *
     * @param config
     * @param serviceAccount Cloud Run、App Engine、Cloud Functions などの Google 環境で実行されるアプリケーションではnullを指定することを強くおすすめします。
     *                       https://firebase.google.com/docs/admin/setup?hl=ja#initialize-sdk
     */
    constructor(config, serviceAccount) {
        // Set up firebase-admin
        if (serviceAccount) {
            // for local
            this.firebaseAdminApp = (0, firebase_admin_1.initializeApp)({
                credential: firebase_admin_1.credential.cert(serviceAccount),
                databaseURL: `https://${serviceAccount.projectId}.firebaseio.com`,
                storageBucket: `${serviceAccount.projectId}.appspot.com`,
            });
        }
        else {
            // Firebase setup by ADC
            this.firebaseAdminApp = (0, firebase_admin_1.initializeApp)();
        }
        // Set up cryptor for freee token
        const cryptoKeyBucket = config_manager_1.ConfigManager.getFirebaseConfig(config, 'cryptoKeyBucket');
        const cryptor = cryptoKeyBucket
            ? new freee_cryptor_1.FreeeCryptor(this.firebaseAdminApp.storage().bucket(cryptoKeyBucket))
            : null;
        // Set up oauth2 client
        const oauth2 = require('simple-oauth2').create(this.getCredentials(config));
        const tokenManager = new token_manager_1.TokenManager(this.firebaseAdminApp, oauth2, cryptor);
        axios_1.default.defaults.baseURL = config_manager_1.ConfigManager.getFreeeConfig(config, 'apiHost');
        this.apiClient = new freee_api_client_1.FreeeAPIClient(tokenManager, axios_1.default);
        this.firebaseAuthClient = new freee_firebase_auth_client_1.FreeeFirebaseAuthClient(this.firebaseAdminApp, oauth2, axios_1.default, tokenManager, config);
    }
    firebaseApp() {
        return this.firebaseAdminApp;
    }
    api() {
        return this.apiClient;
    }
    auth() {
        return this.firebaseAuthClient;
    }
    getCredentials(config) {
        const credentials = {
            client: {
                id: config_manager_1.ConfigManager.config.freee.client_id,
                secret: config_manager_1.ConfigManager.config.freee.client_secret,
            },
            auth: {
                tokenHost: config_manager_1.ConfigManager.getFreeeConfig(config, 'tokenHost'),
                authorizePath: config_manager_1.ConfigManager.getFreeeConfig(config, 'authorizePath'),
                tokenPath: config_manager_1.ConfigManager.getFreeeConfig(config, 'tokenPath'),
            },
        };
        return credentials;
    }
}
exports.FreeeServerSDK = FreeeServerSDK;
//# sourceMappingURL=freee-server-sdk.js.map