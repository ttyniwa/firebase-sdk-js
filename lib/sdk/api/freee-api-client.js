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
    async get(url, params, userId, customHeaders) {
        const accessToken = await this.tokenManager.get(userId);
        const headers = Object.assign({ Authorization: `Bearer ${accessToken}`, 'X-Api-Version': '2020-06-15', 'Content-Type': 'application/json' }, customHeaders);
        return await this.axios.get(url, {
            params: params,
            headers: headers,
        });
    }
    /**
     * Call freee api by POST
     */
    async post(url, data, userId, customHeaders) {
        const accessToken = await this.tokenManager.get(userId);
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
        const headers = Object.assign(Object.assign(Object.assign({}, sendHeaders), { Authorization: `Bearer ${accessToken}`, 'X-Api-Version': '2020-06-15', 'Content-Type': sendContentType }), customHeaders);
        return await this.axios.post(url, sendData, {
            maxContentLength: maxContentLength,
            headers: headers,
        });
    }
    /**
     * Call freee api by PUT
     */
    async put(url, data, userId, customHeaders) {
        const accessToken = await this.tokenManager.get(userId);
        const headers = Object.assign({ Authorization: `Bearer ${accessToken}`, 'X-Api-Version': '2020-06-15', 'Content-Type': 'application/json' }, customHeaders);
        return await this.axios.put(url, data, {
            headers: headers,
        });
    }
    /**
     * Call freee api by GET
     */
    async delete(url, data, userId, customHeaders) {
        const accessToken = await this.tokenManager.get(userId);
        const headers = Object.assign({ Authorization: `Bearer ${accessToken}`, 'X-Api-Version': '2020-06-15', 'Content-Type': 'application/json' }, customHeaders);
        return await this.axios.delete(url, {
            data: data,
            headers: headers,
        });
    }
}
exports.FreeeAPIClient = FreeeAPIClient;
//# sourceMappingURL=freee-api-client.js.map