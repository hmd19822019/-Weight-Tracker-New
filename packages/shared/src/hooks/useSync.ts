import { useMemo } from 'react'
import { useWeightStore } from '../stores/weightStore'
import { apiService } from '../services/api'

export function useSync() {
  const {
    records,
    loading,
    setRecords,
    setLoading,
    setError,
  } = useWeightStore()

  const hasPendingChanges = useMemo(() => {
    return records.some(r => r.syncStatus === 'local' || r.syncStatus === 'pending')
  }, [records])

  const pendingCount = useMemo(() => {
    return records.filter(r => r.syncStatus === 'local' || r.syncStatus === 'pending').length
  }, [records])

  const syncRecords = async () => {
    if (records.length === 0) return

    setLoading(true)
    setError(null)
    try {
      const response = await apiService.post<{ synced: typeof records }>('/weight/sync', {
        records,
      })
      setRecords(response.synced)
    } catch (err: any) {
      setError(err.message || 'Failed to sync records')
    } finally {
      setLoading(false)
    }
  }

  return {
    syncRecords,
    hasPendingChanges,
    pendingCount,
    isSyncing: loading,
  }
}
