export interface RequestOptions extends RequestInit {
  params?: Record<string, string>
}

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

class ApiService {
  private baseURL: string = ''
  private token: string = ''

  setBaseURL(url: string): void {
    this.baseURL = url
  }

  getBaseURL(): string {
    return this.baseURL
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
    options: RequestOptions = {}
  ): Promise<T> {
    const { params, ...fetchOptions } = options

    let url = `${this.baseURL}${endpoint}`

    if (params) {
      const queryString = new URLSearchParams(params).toString()
      url += `?${queryString}`
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers as Record<string, string>),
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText,
      })) as { message?: string }
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json() as Promise<T>
  }

  async get<T = any>(endpoint: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params })
  }

  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiService = new ApiService()
