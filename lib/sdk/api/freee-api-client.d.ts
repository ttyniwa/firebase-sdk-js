import { AxiosPromise, AxiosStatic, RawAxiosRequestHeaders } from 'axios';
import { ParamJSON } from '../const/types';
import { TokenManager } from '../services/token-manager';
export declare class FreeeAPIClient {
    private tokenManager;
    private axios;
    constructor(tokenManager: TokenManager, axios: AxiosStatic);
    /**
     * Call freee api by GET
     */
    get<T>(url: string, params: ParamJSON, userId: string, customHeaders?: RawAxiosRequestHeaders): AxiosPromise<T>;
    /**
     * Call freee api by POST
     */
    post<T>(url: string, data: ParamJSON, userId: string, customHeaders?: RawAxiosRequestHeaders): AxiosPromise<T>;
    /**
     * Call freee api by PUT
     */
    put<T>(url: string, data: ParamJSON, userId: string, customHeaders?: RawAxiosRequestHeaders): AxiosPromise<T>;
    /**
     * Call freee api by GET
     */
    delete(url: string, data: ParamJSON, userId: string, customHeaders?: RawAxiosRequestHeaders): AxiosPromise;
}
