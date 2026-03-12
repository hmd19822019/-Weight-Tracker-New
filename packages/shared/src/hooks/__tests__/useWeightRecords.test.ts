import { renderHook, act } from '@testing-library/react'
import { useWeightRecords } from '../useWeightRecords'
import { useWeightStore } from '../../stores/weightStore'
import { apiService } from '../../services/api'
import type { WeightRecord } from '../../types'

// Mock dependencies
jest.mock('../../services/api')
jest.mock('../../stores/weightStore')

const mockApiService = apiService as jest.Mocked<typeof apiService>

describe('useWeightRecords', () => {
  const mockRecords: WeightRecord[] = [
    {
      id: '1',
      userId: 'user1',
      date: new Date('2024-01-01'),
      weight: 70,
      syncStatus: 'synced',
      version: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      userId: 'user1',
      date: new Date('2024-01-02'),
      weight: 69.5,
      syncStatus: 'synced',
      version: 1,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
  ]

  const mockStore = {
    records: mockRecords,
    loading: false,
    error: null,
    setRecords: jest.fn(),
    addRecord: jest.fn(),
    updateRecord: jest.fn(),
    deleteRecord: jest.fn(),
    setLoading: jest.fn(),
    setError: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useWeightStore as unknown as jest.Mock).mockReturnValue(mockStore)
  })

  describe('fetchRecords', () => {
    it('should fetch records and update store', async () => {
      mockApiService.get.mockResolvedValueOnce(mockRecords)

      const { result } = renderHook(() => useWeightRecords())

      await act(async () => {
        await result.current.fetchRecords()
      })

      expect(mockStore.setLoading).toHaveBeenCalledWith(true)
      expect(mockApiService.get).toHaveBeenCalledWith('/weight')
      expect(mockStore.setRecords).toHaveBeenCalledWith(mockRecords)
      expect(mockStore.setLoading).toHaveBeenCalledWith(false)
      expect(mockStore.setError).toHaveBeenCalledWith(null)
    })

    it('should handle fetch error', async () => {
      const error = new Error('Network error')
      mockApiService.get.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useWeightRecords())

      await act(async () => {
        await result.current.fetchRecords()
      })

      expect(mockStore.setLoading).toHaveBeenCalledWith(true)
      expect(mockStore.setError).toHaveBeenCalledWith('Network error')
      expect(mockStore.setLoading).toHaveBeenCalledWith(false)
    })
  })

  describe('createRecord', () => {
    it('should create a new record', async () => {
      const newRecord: WeightRecord = {
        id: '3',
        userId: 'user1',
        date: new Date('2024-01-03'),
        weight: 69,
        syncStatus: 'synced',
        version: 1,
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
      }

      mockApiService.post.mockResolvedValueOnce(newRecord)

      const { result } = renderHook(() => useWeightRecords())

      await act(async () => {
        await result.current.createRecord(newRecord)
      })

      expect(mockStore.setLoading).toHaveBeenCalledWith(true)
      expect(mockApiService.post).toHaveBeenCalledWith('/weight', newRecord)
      expect(mockStore.addRecord).toHaveBeenCalledWith(newRecord)
      expect(mockStore.setLoading).toHaveBeenCalledWith(false)
      expect(mockStore.setError).toHaveBeenCalledWith(null)
    })

    it('should handle create error', async () => {
      const newRecord: WeightRecord = {
        id: '3',
        userId: 'user1',
        date: new Date('2024-01-03'),
        weight: 69,
        syncStatus: 'local',
        version: 1,
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
      }

      const error = new Error('Create failed')
      mockApiService.post.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useWeightRecords())

      await act(async () => {
        await result.current.createRecord(newRecord)
      })

      expect(mockStore.setError).toHaveBeenCalledWith('Create failed')
      expect(mockStore.setLoading).toHaveBeenCalledWith(false)
    })
  })

  describe('updateRecord', () => {
    it('should update an existing record', async () => {
      const updates = { weight: 70.5, notes: 'Updated' }
      const updatedRecord = { ...mockRecords[0], ...updates }

      mockApiService.put.mockResolvedValueOnce(updatedRecord)

      const { result } = renderHook(() => useWeightRecords())

      await act(async () => {
        await result.current.updateRecord('1', updates)
      })

      expect(mockStore.setLoading).toHaveBeenCalledWith(true)
      expect(mockApiService.put).toHaveBeenCalledWith('/weight/1', updates)
      expect(mockStore.updateRecord).toHaveBeenCalledWith('1', updatedRecord)
      expect(mockStore.setLoading).toHaveBeenCalledWith(false)
      expect(mockStore.setError).toHaveBeenCalledWith(null)
    })

    it('should handle update error', async () => {
      const error = new Error('Update failed')
      mockApiService.put.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useWeightRecords())

      await act(async () => {
        await result.current.updateRecord('1', { weight: 70.5 })
      })

      expect(mockStore.setError).toHaveBeenCalledWith('Update failed')
      expect(mockStore.setLoading).toHaveBeenCalledWith(false)
    })
  })

  describe('deleteRecord', () => {
    it('should delete a record', async () => {
      mockApiService.delete.mockResolvedValueOnce({ success: true })

      const { result } = renderHook(() => useWeightRecords())

      await act(async () => {
        await result.current.deleteRecord('1')
      })

      expect(mockStore.setLoading).toHaveBeenCalledWith(true)
      expect(mockApiService.delete).toHaveBeenCalledWith('/weight/1')
      expect(mockStore.deleteRecord).toHaveBeenCalledWith('1')
      expect(mockStore.setLoading).toHaveBeenCalledWith(false)
      expect(mockStore.setError).toHaveBeenCalledWith(null)
    })

    it('should handle delete error', async () => {
      const error = new Error('Delete failed')
      mockApiService.delete.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useWeightRecords())

      await act(async () => {
        await result.current.deleteRecord('1')
      })

      expect(mockStore.setError).toHaveBeenCalledWith('Delete failed')
      expect(mockStore.setLoading).toHaveBeenCalledWith(false)
    })
  })

  describe('store state access', () => {
    it('should expose records from store', () => {
      const { result } = renderHook(() => useWeightRecords())
      expect(result.current.records).toEqual(mockRecords)
    })

    it('should expose loading state', () => {
      const { result } = renderHook(() => useWeightRecords())
      expect(result.current.loading).toBe(false)
    })

    it('should expose error state', () => {
      const { result } = renderHook(() => useWeightRecords())
      expect(result.current.error).toBeNull()
    })
  })
})
