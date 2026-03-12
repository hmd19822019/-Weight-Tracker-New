import { renderHook } from '@testing-library/react'
import { useStatistics } from '../useStatistics'
import { useWeightStore } from '../../stores/weightStore'
import { calculateBMI } from '../../utils/calculation'
import type { WeightRecord } from '../../types'

// Mock dependencies
jest.mock('../../stores/weightStore')
jest.mock('../../utils/calculation')

const mockCalculateBMI = calculateBMI as jest.MockedFunction<typeof calculateBMI>

describe('useStatistics', () => {
  const mockRecords: WeightRecord[] = [
    {
      id: '1',
      userId: 'user1',
      date: new Date('2024-01-01'),
      weight: 70,
      bodyFat: 20,
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
      bodyFat: 19.5,
      syncStatus: 'synced',
      version: 1,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
    {
      id: '3',
      userId: 'user1',
      date: new Date('2024-01-03'),
      weight: 69,
      syncStatus: 'synced',
      version: 1,
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03'),
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
    mockCalculateBMI.mockReturnValue(23.5)
  })

  describe('latestWeight', () => {
    it('should return the most recent weight record', () => {
      const { result } = renderHook(() => useStatistics())
      expect(result.current.latestWeight).toEqual(mockRecords[2])
    })

    it('should return undefined when no records', () => {
      ;(useWeightStore as unknown as jest.Mock).mockReturnValue({
        ...mockStore,
        records: [],
      })

      const { result } = renderHook(() => useStatistics())
      expect(result.current.latestWeight).toBeUndefined()
    })
  })

  describe('weightChange', () => {
    it('should calculate weight change from first to last record', () => {
      const { result } = renderHook(() => useStatistics())
      expect(result.current.weightChange).toBe(-1) // 69 - 70
    })

    it('should return 0 when less than 2 records', () => {
      ;(useWeightStore as unknown as jest.Mock).mockReturnValue({
        ...mockStore,
        records: [mockRecords[0]],
      })

      const { result } = renderHook(() => useStatistics())
      expect(result.current.weightChange).toBe(0)
    })

    it('should return 0 when no records', () => {
      ;(useWeightStore as unknown as jest.Mock).mockReturnValue({
        ...mockStore,
        records: [],
      })

      const { result } = renderHook(() => useStatistics())
      expect(result.current.weightChange).toBe(0)
    })
  })

  describe('averageWeight', () => {
    it('should calculate average weight', () => {
      const { result } = renderHook(() => useStatistics())
      const expected = (70 + 69.5 + 69) / 3
      expect(result.current.averageWeight).toBeCloseTo(expected, 2)
    })

    it('should return 0 when no records', () => {
      ;(useWeightStore as unknown as jest.Mock).mockReturnValue({
        ...mockStore,
        records: [],
      })

      const { result } = renderHook(() => useStatistics())
      expect(result.current.averageWeight).toBe(0)
    })
  })

  describe('bmi', () => {
    it('should calculate BMI for latest weight with height', () => {
      const { result } = renderHook(() => useStatistics(175))
      expect(mockCalculateBMI).toHaveBeenCalledWith(69, 175)
      expect(result.current.bmi).toBe(23.5)
    })

    it('should return undefined when no height provided', () => {
      const { result } = renderHook(() => useStatistics())
      expect(result.current.bmi).toBeUndefined()
    })

    it('should return undefined when no records', () => {
      ;(useWeightStore as unknown as jest.Mock).mockReturnValue({
        ...mockStore,
        records: [],
      })

      const { result } = renderHook(() => useStatistics(175))
      expect(result.current.bmi).toBeUndefined()
    })
  })

  describe('totalRecords', () => {
    it('should return total number of records', () => {
      const { result } = renderHook(() => useStatistics())
      expect(result.current.totalRecords).toBe(3)
    })

    it('should return 0 when no records', () => {
      ;(useWeightStore as unknown as jest.Mock).mockReturnValue({
        ...mockStore,
        records: [],
      })

      const { result } = renderHook(() => useStatistics())
      expect(result.current.totalRecords).toBe(0)
    })
  })

  describe('averageBodyFat', () => {
    it('should calculate average body fat from records with bodyFat', () => {
      const { result } = renderHook(() => useStatistics())
      const expected = (20 + 19.5) / 2 // Only first 2 records have bodyFat
      expect(result.current.averageBodyFat).toBeCloseTo(expected, 2)
    })

    it('should return undefined when no records have bodyFat', () => {
      const recordsWithoutBodyFat = mockRecords.map(r => ({ ...r, bodyFat: undefined }))
      ;(useWeightStore as unknown as jest.Mock).mockReturnValue({
        ...mockStore,
        records: recordsWithoutBodyFat,
      })

      const { result } = renderHook(() => useStatistics())
      expect(result.current.averageBodyFat).toBeUndefined()
    })

    it('should return undefined when no records', () => {
      ;(useWeightStore as unknown as jest.Mock).mockReturnValue({
        ...mockStore,
        records: [],
      })

      const { result } = renderHook(() => useStatistics())
      expect(result.current.averageBodyFat).toBeUndefined()
    })
  })
})
