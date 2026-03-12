import { renderHook, act } from '@testing-library/react'
import { useSync } from '../useSync'
import { useWeightStore } from '../../stores/weightStore'
import { apiService } from '../../services/api'
import type { WeightRecord } from '../../types'

// Mock dependencies
jest.mock('../../services/api')
jest.mock('../../stores/weightStore')

const mockApiService = apiService as jest.Mocked<typeof apiService>

describe('useSync', () => {
  const mockLocalRecords: WeightRecord[] = [
    {
      id: '1',
      userId: 'user1',
      date: new Date('2024-01-01'),
      weight: 70,
      syncStatus: 'local',
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
    records: mockLocalRecords,
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

  describe('syncRecords', () => {
    it('should sync local records to server', async () => {
      const syncedRecords = mockLocalRecords.map(r => ({ ...r, syncStatus: 'synced' as const }))
      mockApiService.post.mockResolvedValueOnce({ synced: syncedRecords })

      const { result } = renderHook(() => useSync())

      await act(async () => {
        await result.current.syncRecords()
      })

      expect(mockStore.setLoading).toHaveBeenCalledWith(true)
      expect(mockApiService.post).toHaveBeenCalledWith('/weight/sync', {
        records: mockLocalRecords,
      })
      expect(mockStore.setRecords).toHaveBeenCalledWith(syncedRecords)
      expect(mockStore.setLoading).toHaveBeenCalledWith(false)
      expect(mockStore.setError).toHaveBeenCalledWith(null)
    })

    it('should handle sync error', async () => {
      const error = new Error('Sync failed')
      mockApiService.post.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useSync())

      await act(async () => {
        await result.current.syncRecords()
      })

      expect(mockStore.setError).toHaveBeenCalledWith('Sync failed')
      expect(mockStore.setLoading).toHaveBeenCalledWith(false)
    })

    it('should not sync when no records', async () => {
      ;(useWeightStore as unknown as jest.Mock).mockReturnValue({
        ...mockStore,
        records: [],
      })

      const { result } = renderHook(() => useSync())

      await act(async () => {
        await result.current.syncRecords()
      })

      expect(mockApiService.post).not.toHaveBeenCalled()
    })
  })

  describe('hasPendingChanges', () => {
    it('should return true when there are local records', () => {
      const { result } = renderHook(() => useSync())
      expect(result.current.hasPendingChanges).toBe(true)
    })

    it('should return false when all records are synced', () => {
      const syncedRecords = mockLocalRecords.map(r => ({ ...r, syncStatus: 'synced' as const }))
      ;(useWeightStore as unknown as jest.Mock).mockReturnValue({
        ...mockStore,
        records: syncedRecords,
      })

      const { result } = renderHook(() => useSync())
      expect(result.current.hasPendingChanges).toBe(false)
    })

    it('should return false when no records', () => {
      ;(useWeightStore as unknown as jest.Mock).mockReturnValue({
        ...mockStore,
        records: [],
      })

      const { result } = renderHook(() => useSync())
      expect(result.current.hasPendingChanges).toBe(false)
    })
  })

  describe('pendingCount', () => {
    it('should count records with local or pending status', () => {
      const mixedRecords: WeightRecord[] = [
        { ...mockLocalRecords[0], syncStatus: 'local' },
        { ...mockLocalRecords[1], syncStatus: 'pending' },
        { ...mockLocalRecords[0], id: '3', syncStatus: 'synced' },
      ]
      ;(useWeightStore as unknown as jest.Mock).mockReturnValue({
        ...mockStore,
        records: mixedRecords,
      })

      const { result } = renderHook(() => useSync())
      expect(result.current.pendingCount).toBe(2)
    })

    it('should return 0 when all records are synced', () => {
      const syncedRecords = mockLocalRecords.map(r => ({ ...r, syncStatus: 'synced' as const }))
      ;(useWeightStore as unknown as jest.Mock).mockReturnValue({
        ...mockStore,
        records: syncedRecords,
      })

      const { result } = renderHook(() => useSync())
      expect(result.current.pendingCount).toBe(0)
    })
  })

  describe('isSyncing', () => {
    it('should expose loading state from store', () => {
      ;(useWeightStore as unknown as jest.Mock).mockReturnValue({
        ...mockStore,
        loading: true,
      })

      const { result } = renderHook(() => useSync())
      expect(result.current.isSyncing).toBe(true)
    })

    it('should return false when not loading', () => {
      const { result } = renderHook(() => useSync())
      expect(result.current.isSyncing).toBe(false)
    })
  })
})
