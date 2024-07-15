"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreeeAPIClient = void 0;
const FormData = require("form-data");
class FreeeAPIClient {
    constructor(tokenManager, axios) {
        this.tokenManager = tokenManager;
        this.axios = axios;
    }
    /**
     * Call freee api by GET
     */
    get(url, params, userId, customHeaders) {
        return this.tokenManager.get(userId).then((accessToken) => {
            const headers = Object.assign({ Authorization: `Bearer ${accessToken}`, 'X-Api-Version': '2020-06-15', 'Content-Type': 'application/json' }, customHeaders);
            return this.axios.get(url, {
                params: params,
                headers: headers,
            });
        });
    }
    /**
     * Call freee api by POST
     */
    post(url, data, userId, customHeaders) {
        return this.tokenManager.get(userId).then((accessToken) => {
            let sendData = data;
            let sendHeaders = {};
            let sendContentType = 'application/json';
            const maxContentLength = 104857600;
            const isMultipartRequest = url === 'api/1/receipts';
            if (isMultipartRequest) {
                const formData = new FormData();
                Object.keys(data).forEach((key) => {
                    formData.append(key, data[key]);
                });
                sendData = formData;
                sendHeaders = formData.getHeaders();
                sendContentType = 'multipart/form-data';
            }
            sendHeaders['Authorization'] = `Bearer ${accessToken}`;
            sendHeaders['X-Api-Version'] = '2020-06-15';
            sendHeaders['Content-Type'] = sendContentType;
            const headers = Object.assign(Object.assign({}, sendHeaders), customHeaders);
            return this.axios.post(url, sendData, {
                maxContentLength: maxContentLength,
                headers: headers,
            });
        });
    }
    /**
     * Call freee api by PUT
     */
    put(url, data, userId, customHeaders) {
        return this.tokenManager.get(userId).then((accessToken) => {
            const headers = Object.assign({ Authorization: `Bearer ${accessToken}`, 'X-Api-Version': '2020-06-15', 'Content-Type': 'application/json' }, customHeaders);
            return this.axios.put(url, data, {
                headers: headers,
            });
        });
    }
    /**
     * Call freee api by GET
     */
    delete(url, data, userId, customHeaders) {
        return this.tokenManager.get(userId).then((accessToken) => {
            const headers = Object.assign({ Authorization: `Bearer ${accessToken}`, 'X-Api-Version': '2020-06-15', 'Content-Type': 'application/json' }, customHeaders);
            return this.axios.delete(url, {
                data: data,
                headers: headers,
            });
        });
    }
}
exports.FreeeAPIClient = FreeeAPIClient;
//# sourceMappingURL=freee-api-client.js.map