import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios'

export interface RequestOptions {
  params?: Record<string, string>
  headers?: Record<string, string>
  timeout?: number
}

/**
 * API Service with axios and interceptors
 * Handles authentication, error handling, and request/response transformation
 */
class ApiService {
  private axiosInstance: AxiosInstance
  private token: string = ''

  constructor() {
    this.axiosInstance = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor - add auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor - handle errors
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response
      },
      (error: AxiosError) => {
        if (error.response) {
          // Server responded with error status
          const message = (error.response.data as any)?.message || error.message
          throw new Error(message)
        } else if (error.request) {
          // Request made but no response (network error)
          throw new Error('Network error: Unable to reach server')
        } else {
          // Request setup error
          throw new Error(error.message || 'Request failed')
        }
      }
    )
  }

  setBaseURL(url: string): void {
    this.axiosInstance.defaults.baseURL = url
  }

  getBaseURL(): string {
    return this.axiosInstance.defaults.baseURL || ''
  }

  setToken(token: string): void {
    this.token = token
  }

  getToken(): string {
    return this.token
  }

  clearToken(): void {
    this.token = ''
  }

  async request<T = any>(
    endpoint: string,
    options: RequestOptions & { method?: string; data?: any } = {}
  ): Promise<T> {
    const { params, headers, timeout, method = 'GET', data } = options

    const config: AxiosRequestConfig = {
      url: endpoint,
      method,
      params,
      headers,
      timeout,
      data,
    }

    try {
      const response = await this.axiosInstance.request<T>(config)
      return response.data
    } catch (error: any) {
      // Handle errors that bypass interceptor (for testing)
      if (error.response) {
        const message = error.response.data?.message || error.message
        throw new Error(message)
      } else if (error.request) {
        throw new Error('Network error: Unable to reach server')
      } else {
        throw new Error(error.message || 'Request failed')
      }
    }
  }

  async get<T = any>(endpoint: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params })
  }

  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', data })
  }

  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', data })
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiService = new ApiService()
