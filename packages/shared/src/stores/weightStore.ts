import { create } from 'zustand'
import type { WeightRecord } from '../types'

interface WeightState {
  records: WeightRecord[]
  loading: boolean
  error: string | null
}

interface WeightActions {
  setRecords: (records: WeightRecord[]) => void
  addRecord: (record: WeightRecord) => void
  updateRecord: (id: string, updates: Partial<WeightRecord>) => void
  deleteRecord: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

type WeightStore = WeightState & WeightActions

export const useWeightStore = create<WeightStore>((set) => ({
  // Initial state
  records: [],
  loading: false,
  error: null,

  // Actions
  setRecords: (records) => set({ records }),

  addRecord: (record) =>
    set((state) => ({
      records: [...state.records, record],
    })),

  updateRecord: (id, updates) =>
    set((state) => ({
      records: state.records.map((record) =>
        record.id === id ? { ...record, ...updates } : record
      ),
    })),

  deleteRecord: (id) =>
    set((state) => ({
      records: state.records.filter((record) => record.id !== id),
    })),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),
}))
