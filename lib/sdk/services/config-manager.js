"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
const functions = require("firebase-functions");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const adminConfig = JSON.parse(process.env.FIREBASE_CONFIG);
const projectId = adminConfig.projectId;
const region = process.env.ENV_REGION &&
    functions.SUPPORTED_REGIONS.includes(process.env.ENV_REGION)
    ? process.env.ENV_REGION
    : 'asia-northeast1';
const DEFAULT_SDK_CONFIG = {
    freee: {
        apiHost: 'https://api.freee.co.jp',
        appHost: 'http://localhost:5000',
        authHost: `http://localhost:5001/${projectId}/${region}/api/auth`,
        redirectPath: '/redirect',
        callbackPath: '/callback',
        companiesPath: '/companies',
        homePath: '/',
        tokenHost: 'https://accounts.secure.freee.co.jp',
        authorizePath: '/public_api/authorize',
        tokenPath: '/public_api/token',
    },
    firebase: {
        cryptoKeyBucket: `${projectId}.appspot.com`,
    },
};
const PRODUCTION_SDK_CONFIG = {
    freee: {
        appHost: `https://${projectId}.web.app`,
        authHost: `https://${region}-${projectId}.cloudfunctions.net/api/auth`,
        tokenHost: 'https://accounts.secure.freee.co.jp',
    },
};
class ConfigManager {
    static getFirebaseConfig(sdkConfig, key) {
        var _a, _b, _c, _d, _e;
        return ((_d = (_b = (_a = sdkConfig === null || sdkConfig === void 0 ? void 0 : sdkConfig.firebase) === null || _a === void 0 ? void 0 : _a[key]) !== null && _b !== void 0 ? _b : (this.isProduction ? (_c = PRODUCTION_SDK_CONFIG.firebase) === null || _c === void 0 ? void 0 : _c[key] : undefined)) !== null && _d !== void 0 ? _d : 
        // DEFAULT_SDK_CONFIG.firebaseにはcryptoKeyBucketしか定義されていないので、エラーを回避するために型アサーションした
        (_e = DEFAULT_SDK_CONFIG.firebase) === null || _e === void 0 ? void 0 : _e[key]);
    }
    static getFreeeConfig(sdkConfig, key) {
        var _a, _b, _c, _d;
        return ((_d = (_b = (_a = sdkConfig === null || sdkConfig === void 0 ? void 0 : sdkConfig.freee) === null || _a === void 0 ? void 0 : _a[key]) !== null && _b !== void 0 ? _b : (this.isProduction ? (_c = PRODUCTION_SDK_CONFIG.freee) === null || _c === void 0 ? void 0 : _c[key] : undefined)) !== null && _d !== void 0 ? _d : DEFAULT_SDK_CONFIG.freee[key]);
    }
    static get config() {
        return {
            env: {
                mode: process.env.ENV_MODE || 'production',
                region,
            },
            freee: {
                client_id: process.env.FREEE_CLIENT_ID || '',
                client_secret: process.env.FREEE_CLIENT_SECRET || '',
            },
        };
    }
    static get isProduction() {
        return this.config.env.mode === 'production';
    }
}
exports.ConfigManager = ConfigManager;
//# sourceMappingURL=config-manager.js.map