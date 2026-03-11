import { useWeightStore } from '../weightStore'
import type { WeightRecord } from '../../types'

describe('weightStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useWeightStore.setState({
      records: [],
      loading: false,
      error: null,
    })
  })

  describe('initial state', () => {
    it('should have empty records array', () => {
      const { records } = useWeightStore.getState()
      expect(records).toEqual([])
    })

    it('should have loading as false', () => {
      const { loading } = useWeightStore.getState()
      expect(loading).toBe(false)
    })

    it('should have error as null', () => {
      const { error } = useWeightStore.getState()
      expect(error).toBeNull()
    })
  })

  describe('setRecords', () => {
    it('should set records', () => {
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
      ]

      useWeightStore.getState().setRecords(mockRecords)
      const { records } = useWeightStore.getState()
      expect(records).toEqual(mockRecords)
    })
  })

  describe('addRecord', () => {
    it('should add a new record', () => {
      const newRecord: WeightRecord = {
        id: '1',
        userId: 'user1',
        date: new Date('2024-01-01'),
        weight: 70,
        syncStatus: 'local',
        version: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      useWeightStore.getState().addRecord(newRecord)
      const { records } = useWeightStore.getState()
      expect(records).toHaveLength(1)
      expect(records[0]).toEqual(newRecord)
    })

    it('should add multiple records', () => {
      const record1: WeightRecord = {
        id: '1',
        userId: 'user1',
        date: new Date('2024-01-01'),
        weight: 70,
        syncStatus: 'local',
        version: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      const record2: WeightRecord = {
        id: '2',
        userId: 'user1',
        date: new Date('2024-01-02'),
        weight: 69.5,
        syncStatus: 'local',
        version: 1,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
      }

      useWeightStore.getState().addRecord(record1)
      useWeightStore.getState().addRecord(record2)
      const { records } = useWeightStore.getState()
      expect(records).toHaveLength(2)
    })
  })

  describe('updateRecord', () => {
    beforeEach(() => {
      const mockRecord: WeightRecord = {
        id: '1',
        userId: 'user1',
        date: new Date('2024-01-01'),
        weight: 70,
        syncStatus: 'synced',
        version: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }
      useWeightStore.getState().setRecords([mockRecord])
    })

    it('should update an existing record', () => {
      useWeightStore.getState().updateRecord('1', { weight: 71 })
      const { records } = useWeightStore.getState()
      expect(records[0].weight).toBe(71)
    })

    it('should update multiple fields', () => {
      useWeightStore.getState().updateRecord('1', {
        weight: 71,
        bodyFat: 15,
        notes: 'Updated note',
      })
      const { records } = useWeightStore.getState()
      expect(records[0].weight).toBe(71)
      expect(records[0].bodyFat).toBe(15)
      expect(records[0].notes).toBe('Updated note')
    })

    it('should not update if record not found', () => {
      const initialRecords = useWeightStore.getState().records
      useWeightStore.getState().updateRecord('999', { weight: 100 })
      const { records } = useWeightStore.getState()
      expect(records).toEqual(initialRecords)
    })
  })

  describe('deleteRecord', () => {
    beforeEach(() => {
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
      useWeightStore.getState().setRecords(mockRecords)
    })

    it('should delete a record', () => {
      useWeightStore.getState().deleteRecord('1')
      const { records } = useWeightStore.getState()
      expect(records).toHaveLength(1)
      expect(records[0].id).toBe('2')
    })

    it('should not change records if id not found', () => {
      useWeightStore.getState().deleteRecord('999')
      const { records } = useWeightStore.getState()
      expect(records).toHaveLength(2)
    })
  })

  describe('setLoading', () => {
    it('should set loading to true', () => {
      useWeightStore.getState().setLoading(true)
      const { loading } = useWeightStore.getState()
      expect(loading).toBe(true)
    })

    it('should set loading to false', () => {
      useWeightStore.getState().setLoading(true)
      useWeightStore.getState().setLoading(false)
      const { loading } = useWeightStore.getState()
      expect(loading).toBe(false)
    })
  })

  describe('setError', () => {
    it('should set error message', () => {
      useWeightStore.getState().setError('Test error')
      const { error } = useWeightStore.getState()
      expect(error).toBe('Test error')
    })

    it('should clear error', () => {
      useWeightStore.getState().setError('Test error')
      useWeightStore.getState().setError(null)
      const { error } = useWeightStore.getState()
      expect(error).toBeNull()
    })
  })
})

