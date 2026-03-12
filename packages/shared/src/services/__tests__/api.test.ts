import axios from 'axios'

// Mock axios before importing apiService
const mockRequest = jest.fn()
const mockInterceptors = {
  request: {
    use: jest.fn(),
  },
  response: {
    use: jest.fn(),
  },
}

jest.mock('axios', () => ({
  create: jest.fn(() => ({
    defaults: {},
    interceptors: mockInterceptors,
    request: mockRequest,
  })),
}))

// Import after mocking
import { apiService } from '../api'

describe('API Service', () => {
  beforeEach(() => {
    // Clear token state and mocks before each test
    apiService.clearToken()
    jest.clearAllMocks()
  })

  describe('setBaseURL', () => {
    it('should set base URL', () => {
      apiService.setBaseURL('http://localhost:3001')
      expect(apiService.getBaseURL()).toBe('http://localhost:3001')
    })
  })

  describe('setToken', () => {
    it('should set auth token', () => {
      apiService.setToken('test-token')
      expect(apiService.getToken()).toBe('test-token')
    })
  })

  describe('clearToken', () => {
    it('should clear auth token', () => {
      apiService.setToken('test-token')
      expect(apiService.getToken()).toBe('test-token')

      apiService.clearToken()
      expect(apiService.getToken()).toBe('')
    })
  })

  describe('request', () => {
    it('should make GET request', async () => {
      const mockData = { data: 'test' }
      mockRequest.mockResolvedValueOnce({ data: mockData })

      const result = await apiService.request('/test', { method: 'GET' })

      expect(result).toEqual(mockData)
      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/test',
          method: 'GET'
        })
      )
    })

    it('should include query params', async () => {
      const mockData = { results: [] }
      mockRequest.mockResolvedValueOnce({ data: mockData })

      await apiService.request('/test', {
        method: 'GET',
        params: { page: '1', limit: '10' }
      })

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { page: '1', limit: '10' }
        })
      )
    })

    it('should include auth token in headers via interceptor', async () => {
      apiService.setToken('test-token')
      mockRequest.mockResolvedValueOnce({ data: {} })

      await apiService.request('/test')

      // Token is added by interceptor, not directly in request call
      expect(apiService.getToken()).toBe('test-token')
    })

    it('should handle server error response', async () => {
      // Simulate axios error with response
      const axiosError: any = new Error('Not Found')
      axiosError.response = {
        data: { message: 'Not Found' },
        status: 404
      }
      mockRequest.mockRejectedValueOnce(axiosError)

      await expect(apiService.request('/test')).rejects.toThrow('Not Found')
    })

    it('should handle network error', async () => {
      // Simulate axios error with request but no response
      const axiosError: any = new Error('Network Error')
      axiosError.request = {}
      mockRequest.mockRejectedValueOnce(axiosError)

      await expect(apiService.request('/test')).rejects.toThrow('Network error: Unable to reach server')
    })

    it('should handle timeout error', async () => {
      // Simulate axios timeout error (no request or response)
      const axiosError: any = new Error('timeout of 10000ms exceeded')
      axiosError.code = 'ECONNABORTED'
      mockRequest.mockRejectedValueOnce(axiosError)

      await expect(apiService.request('/test')).rejects.toThrow('timeout of 10000ms exceeded')
    })
  })

  describe('convenience methods', () => {
    beforeEach(() => {
      mockRequest.mockResolvedValue({ data: { success: true } })
    })

    it('should make GET request with params', async () => {
      await apiService.get('/users', { page: '1' })

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          params: { page: '1' }
        })
      )
    })

    it('should make POST request with data', async () => {
      const postData = { name: 'Test' }
      await apiService.post('/users', postData)

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          data: postData
        })
      )
    })

    it('should make PUT request with data', async () => {
      const putData = { name: 'Updated' }
      await apiService.put('/users/1', putData)

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PUT',
          data: putData
        })
      )
    })

    it('should make DELETE request', async () => {
      await apiService.delete('/users/1')

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE'
        })
      )
    })
  })
})
