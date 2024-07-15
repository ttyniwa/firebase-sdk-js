import { AxiosPromise, AxiosStatic } from 'axios';
import { ParamJSON, CustomHeaders } from '../const/types';
import { TokenManager } from '../services/token-manager';
export declare class FreeeAPIClient {
    private tokenManager;
    private axios;
    constructor(tokenManager: TokenManager, axios: AxiosStatic);
    /**
     * Call freee api by GET
     */
    get<T = any>(url: string, params: ParamJSON, userId: string, customHeaders?: CustomHeaders): AxiosPromise<T>;
    /**
     * Call freee api by POST
     */
    post<T = any>(url: string, data: ParamJSON, userId: string, customHeaders?: CustomHeaders): AxiosPromise<T>;
    /**
     * Call freee api by PUT
     */
    put<T = any>(url: string, data: ParamJSON, userId: string, customHeaders?: CustomHeaders): AxiosPromise<T>;
    /**
     * Call freee api by GET
     */
    delete(url: string, data: ParamJSON, userId: string, customHeaders?: CustomHeaders): AxiosPromise;
}
