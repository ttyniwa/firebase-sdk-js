import { AxiosStatic, RawAxiosRequestHeaders } from 'axios';
import { TokenManager } from '../services/token-manager';
export interface ParamJSON {
    [key: string]: any;
}
export declare class FreeeAPIClient {
    private tokenManager;
    private axios;
    constructor(tokenManager: TokenManager, axios: AxiosStatic);
    /**
     * Call freee api by GET
     */
    get(url: string, params: ParamJSON, userId: string, customHeaders?: RawAxiosRequestHeaders): Promise<import("axios").AxiosResponse<any, any>>;
    /**
     * Call freee api by POST
     */
    post(url: string, data: ParamJSON, userId: string, customHeaders?: RawAxiosRequestHeaders): Promise<import("axios").AxiosResponse<any, any>>;
    /**
     * Call freee api by PUT
     */
    put(url: string, data: ParamJSON, userId: string, customHeaders?: RawAxiosRequestHeaders): Promise<import("axios").AxiosResponse<any, any>>;
    /**
     * Call freee api by GET
     */
    delete(url: string, data: ParamJSON, userId: string, customHeaders?: RawAxiosRequestHeaders): Promise<import("axios").AxiosResponse<any, any>>;
}
