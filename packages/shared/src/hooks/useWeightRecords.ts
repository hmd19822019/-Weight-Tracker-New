import { useWeightStore } from '../stores/weightStore'
import { apiService } from '../services/api'
import type { WeightRecord } from '../types'

export function useWeightRecords() {
  const {
    records,
    loading,
    error,
    setRecords,
    addRecord,
    updateRecord: updateStoreRecord,
    deleteRecord: deleteStoreRecord,
    setLoading,
    setError,
  } = useWeightStore()

  const fetchRecords = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiService.get<WeightRecord[]>('/weight')
      setRecords(data)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch records')
    } finally {
      setLoading(false)
    }
  }

  const createRecord = async (record: WeightRecord) => {
    setLoading(true)
    setError(null)
    try {
      const created = await apiService.post<WeightRecord>('/weight', record)
      addRecord(created)
    } catch (err: any) {
      setError(err.message || 'Failed to create record')
    } finally {
      setLoading(false)
    }
  }

  const updateRecord = async (id: string, updates: Partial<WeightRecord>) => {
    setLoading(true)
    setError(null)
    try {
      const updated = await apiService.put<WeightRecord>(`/weight/${id}`, updates)
      updateStoreRecord(id, updated)
    } catch (err: any) {
      setError(err.message || 'Failed to update record')
    } finally {
      setLoading(false)
    }
  }

  const deleteRecord = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      await apiService.delete(`/weight/${id}`)
      deleteStoreRecord(id)
    } catch (err: any) {
      setError(err.message || 'Failed to delete record')
    } finally {
      setLoading(false)
    }
  }

  return {
    records,
    loading,
    error,
    fetchRecords,
    createRecord,
    updateRecord,
    deleteRecord,
  }
}
