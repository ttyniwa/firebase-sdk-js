import * as functions from 'firebase-functions';
import { SDKConfig, SDKFirebaseConfig, SDKFreeeConfig } from '../const/types';
type SupportedRegions = (typeof functions.SUPPORTED_REGIONS)[number];
type FirebaseConfigKeys = keyof SDKFirebaseConfig;
type FreeeConfigKeys = keyof SDKFreeeConfig;
interface FirebaseFunctionsConfigs {
    env: {
        mode: 'production' | string;
        region: SupportedRegions;
    };
    freee: {
        client_id: string;
        client_secret: string;
    };
}
export declare class ConfigManager {
    static getFirebaseConfig(sdkConfig: SDKConfig, key: FirebaseConfigKeys): string | undefined;
    static getFreeeConfig(sdkConfig: SDKConfig, key: FreeeConfigKeys): string;
    static get config(): FirebaseFunctionsConfigs;
    private static get isProduction();
}
export {};
