"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLocalSdkConfig = createLocalSdkConfig;
exports.createGcpSdkConfig = createGcpSdkConfig;
const projectId = JSON.parse(process.env.FIREBASE_CONFIG).projectId;
const DEFAULT_SDK_CONFIG = {
    functionsRegion: 'asia-northeast1',
    apiHost: 'https://api.freee.co.jp',
    redirectPath: '/redirect',
    callbackPath: '/callback',
    companiesPath: '/companies',
    homePath: '/',
    tokenHost: 'https://accounts.secure.freee.co.jp',
    authorizePath: '/public_api/authorize',
    tokenPath: '/public_api/token',
};
function createLocalSdkConfig(config) {
    return Object.assign(Object.assign(Object.assign({}, DEFAULT_SDK_CONFIG), { appHost: 'http://localhost:5000', authHost: `http://localhost:5001/${projectId}/${config.functionsRegion}/api/auth` }), config);
}
function createGcpSdkConfig(config) {
    return Object.assign(Object.assign(Object.assign({}, DEFAULT_SDK_CONFIG), { appHost: `https://${projectId}.web.app`, authHost: `https://${config.functionsRegion}-${projectId}.cloudfunctions.net/api/auth` }), config);
}
//# sourceMappingURL=create-sdk-config.js.map