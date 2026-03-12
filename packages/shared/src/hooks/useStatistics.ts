import { useMemo } from 'react'
import { useWeightStore } from '../stores/weightStore'
import { calculateBMI } from '../utils/calculation'
import type { WeightRecord } from '../types'

export function useStatistics(height?: number) {
  const { records } = useWeightStore()

  const latestWeight = useMemo<WeightRecord | undefined>(() => {
    if (records.length === 0) return undefined
    return records[records.length - 1]
  }, [records])

  const weightChange = useMemo(() => {
    if (records.length < 2) return 0
    const first = records[0].weight
    const last = records[records.length - 1].weight
    return last - first
  }, [records])

  const averageWeight = useMemo(() => {
    if (records.length === 0) return 0
    const sum = records.reduce((acc, record) => acc + record.weight, 0)
    return sum / records.length
  }, [records])

  const bmi = useMemo(() => {
    if (!height || !latestWeight) return undefined
    return calculateBMI(latestWeight.weight, height)
  }, [height, latestWeight])

  const totalRecords = records.length

  const averageBodyFat = useMemo(() => {
    const recordsWithBodyFat = records.filter(r => r.bodyFat !== undefined)
    if (recordsWithBodyFat.length === 0) return undefined
    const sum = recordsWithBodyFat.reduce((acc, record) => acc + (record.bodyFat || 0), 0)
    return sum / recordsWithBodyFat.length
  }, [records])

  return {
    latestWeight,
    weightChange,
    averageWeight,
    bmi,
    totalRecords,
    averageBodyFat,
  }
}
