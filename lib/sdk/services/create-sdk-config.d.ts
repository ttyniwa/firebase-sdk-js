import { SUPPORTED_REGIONS } from 'firebase-functions/v1';
export interface SDKConfig {
    /**
     * cryptoKey for encrypt/decrypt token. (hex string)
     *
     * Example of generation command.
     * `openssl rand -hex 32`
     */
    cryptoKey: string;
    clientId: string;
    clientSecret: string;
    functionsRegion: (typeof SUPPORTED_REGIONS)[number];
    /**
     * Redirect path
     *
     * @defaultValue '/redirect'
     */
    redirectPath?: string;
    /**
     * Callback path
     *
     * @defaultValue '/callback'
     */
    callbackPath?: string;
    /**
     * Companies path
     *
     * @defaultValue '/companies'
     */
    companiesPath?: string;
    /**
     * Home path of an application
     *
     * @defaultValue '/'
     */
    homePath?: string;
    /**
     * Application host url
     *
     * @defaultValue "http://localhost:5000"
     * @defaultValue `https://${process.env.FIREBASE_CONFIG.projectId}.web.app` when process.env.ENV === 'production'
     */
    appHost?: string;
    /**
     * Authorization host url
     *
     * @defaultValue `http://localhost:5001/${process.env.FIREBASE_CONFIG.projectId}/${functionsRegion}/api/auth`
     * @defaultValue `https://${functionsRegion}-${process.env.FIREBASE_CONFIG.projectId}.cloudfunctions.net/api/auth` when process.env.ENV_MODE === 'production'
     */
    authHost?: string;
    /**
     * freee API server host url
     *
     * @defaultValue "https://api.freee.co.jp"
     */
    apiHost?: string;
    /**
     * freee token server host url
     *
     * @defaultValue "https://accounts.secure.freee.co.jp"
     */
    tokenHost?: string;
    /**
     * Authrization path
     *
     * @defaultValue '/public_api/authorize'
     */
    authorizePath?: string;
    /**
     * Token path
     *
     * @defaultValue '/public_api/token'
     */
    tokenPath?: string;
}
export declare function createSdkConfig(config: SDKConfig, isEmulator: boolean): Required<SDKConfig>;
