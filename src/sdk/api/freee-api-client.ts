import { AxiosPromise, AxiosStatic, RawAxiosRequestHeaders } from 'axios'
import { ParamJSON } from '../const/types'
import { TokenManager } from '../services/token-manager'
import * as FormData from 'form-data'

export class FreeeAPIClient {
  private tokenManager: TokenManager
  private axios: AxiosStatic

  constructor(tokenManager: TokenManager, axios: AxiosStatic) {
    this.tokenManager = tokenManager
    this.axios = axios
  }

  /**
   * Call freee api by GET
   */
  get<T>(
    url: string,
    params: ParamJSON,
    userId: string,
    customHeaders?: RawAxiosRequestHeaders,
  ): AxiosPromise<T> {
    return this.tokenManager.get(userId).then((accessToken) => {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        'X-Api-Version': '2020-06-15',
        'Content-Type': 'application/json',
        ...customHeaders,
      }

      return this.axios.get(url, {
        params: params,
        headers: headers,
      })
    })
  }

  /**
   * Call freee api by POST
   */
  post<T>(
    url: string,
    data: ParamJSON,
    userId: string,
    customHeaders?: RawAxiosRequestHeaders,
  ): AxiosPromise<T> {
    return this.tokenManager.get(userId).then((accessToken) => {
      let sendData = data
      let sendHeaders: FormData.Headers = {}
      let sendContentType = 'application/json'
      const maxContentLength = 104857600

      const isMultipartRequest = url === 'api/1/receipts'
      if (isMultipartRequest) {
        const formData = new FormData()
        Object.keys(data).forEach((key) => {
          formData.append(key, data[key])
        })
        sendData = formData
        sendHeaders = formData.getHeaders()
        sendContentType = 'multipart/form-data'
      }

      sendHeaders['Authorization'] = `Bearer ${accessToken}`
      sendHeaders['X-Api-Version'] = '2020-06-15'
      sendHeaders['Content-Type'] = sendContentType

      const headers = {
        ...sendHeaders,
        ...customHeaders,
      }

      return this.axios.post(url, sendData, {
        maxContentLength: maxContentLength,
        headers: headers,
      })
    })
  }

  /**
   * Call freee api by PUT
   */
  put<T>(
    url: string,
    data: ParamJSON,
    userId: string,
    customHeaders?: RawAxiosRequestHeaders,
  ): AxiosPromise<T> {
    return this.tokenManager.get(userId).then((accessToken) => {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        'X-Api-Version': '2020-06-15',
        'Content-Type': 'application/json',
        ...customHeaders,
      }
      return this.axios.put(url, data, {
        headers: headers,
      })
    })
  }

  /**
   * Call freee api by GET
   */
  delete(
    url: string,
    data: ParamJSON,
    userId: string,
    customHeaders?: RawAxiosRequestHeaders,
  ): AxiosPromise {
    return this.tokenManager.get(userId).then((accessToken) => {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        'X-Api-Version': '2020-06-15',
        'Content-Type': 'application/json',
        ...customHeaders,
      }
      return this.axios.delete(url, {
        data: data,
        headers: headers,
      })
    })
  }
}
