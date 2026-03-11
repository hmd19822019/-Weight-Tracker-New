import { apiService } from '../api'

describe('API Service', () => {
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

  describe('request', () => {
    it('should make GET request', async () => {
      // Mock fetch
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: 'test' })
        })
      ) as jest.Mock

      const result = await apiService.request('/test', { method: 'GET' })
      expect(result).toEqual({ data: 'test' })
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({ method: 'GET' })
      )
    })

    it('should include auth token in headers', async () => {
      apiService.setToken('test-token')
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({})
        })
      ) as jest.Mock

      await apiService.request('/test')
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token'
          })
        })
      )
    })

    it('should throw error on failed request', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          statusText: 'Not Found'
        })
      ) as jest.Mock

      await expect(apiService.request('/test')).rejects.toThrow()
    })
  })
})
