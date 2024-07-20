import { AxiosStatic, RawAxiosRequestHeaders } from 'axios'
import { TokenManager } from '../services/token-manager'
import * as FormData from 'form-data'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ParamJSON {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

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
  async get(
    url: string,
    params: ParamJSON,
    userId: string,
    customHeaders?: RawAxiosRequestHeaders,
  ) {
    const accessToken = await this.tokenManager.get(userId)
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'X-Api-Version': '2020-06-15',
      'Content-Type': 'application/json',
      ...customHeaders,
    }
    return await this.axios.get(url, {
      params: params,
      headers: headers,
    })
  }

  /**
   * Call freee api by POST
   */
  async post(
    url: string,
    data: ParamJSON,
    userId: string,
    customHeaders?: RawAxiosRequestHeaders,
  ) {
    const accessToken = await this.tokenManager.get(userId)
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
    const headers = {
      ...sendHeaders,
      Authorization: `Bearer ${accessToken}`,
      'X-Api-Version': '2020-06-15',
      'Content-Type': sendContentType,
      ...customHeaders,
    }
    return await this.axios.post(url, sendData, {
      maxContentLength: maxContentLength,
      headers: headers,
    })
  }

  /**
   * Call freee api by PUT
   */
  async put(
    url: string,
    data: ParamJSON,
    userId: string,
    customHeaders?: RawAxiosRequestHeaders,
  ) {
    const accessToken = await this.tokenManager.get(userId)
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'X-Api-Version': '2020-06-15',
      'Content-Type': 'application/json',
      ...customHeaders,
    }
    return await this.axios.put(url, data, {
      headers: headers,
    })
  }

  /**
   * Call freee api by GET
   */
  async delete(
    url: string,
    data: ParamJSON,
    userId: string,
    customHeaders?: RawAxiosRequestHeaders,
  ) {
    const accessToken = await this.tokenManager.get(userId)
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'X-Api-Version': '2020-06-15',
      'Content-Type': 'application/json',
      ...customHeaders,
    }
    return await this.axios.delete(url, {
      data: data,
      headers: headers,
    })
  }
}
