import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { WeightInput } from '../components/WeightInput'
import { WaterIntakeBar } from '../components/WaterIntakeBar'
import { colors, typography } from '../theme'
import { storage, STORAGE_KEYS } from '../utils/storage'

interface TodayStats {
  lastWeight?: number
  waterIntake: number
  waterTarget: number
}

export const RecordScreen = () => {
  const [todayStats, setTodayStats] = useState<TodayStats>({
    waterIntake: 0,
    waterTarget: 2000,
  })
  const [saving, setSaving] = useState(false)

  const handleWeightSubmit = useCallback(
    async (weight: number, date: Date, notes?: string) => {
      setSaving(true)
      try {
        // Load existing records
        const existing = await storage.getItem<any[]>(STORAGE_KEYS.USER_DATA) || []
        const newRecord = {
          id: Date.now().toString(),
          weight,
          date: date.toISOString(),
          notes,
          syncStatus: 'local',
        }
        await storage.setItem(STORAGE_KEYS.USER_DATA, [...existing, newRecord])
        setTodayStats((prev) => ({ ...prev, lastWeight: weight }))
        Alert.alert('成功', `体重 ${weight}kg 已记录`)
      } catch (error) {
        Alert.alert('错误', '记录失败，请重试')
      } finally {
        setSaving(false)
      }
    },
    []
  )

  const handleWaterAdd = useCallback(async (amount: number) => {
    setTodayStats((prev) => {
      const newIntake = prev.waterIntake + amount
      return { ...prev, waterIntake: newIntake }
    })
  }, [])

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Today's summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>今日概览</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {todayStats.lastWeight ? `${todayStats.lastWeight}kg` : '--'}
              </Text>
              <Text style={styles.summaryLabel}>最新体重</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {todayStats.waterIntake}ml
              </Text>
              <Text style={styles.summaryLabel}>今日饮水</Text>
            </View>
          </View>
        </View>

        {/* Weight input */}
        <Text style={styles.sectionTitle}>记录体重</Text>
        <WeightInput
          onSubmit={handleWeightSubmit}
          initialWeight={todayStats.lastWeight}
        />

        {/* Water intake */}
        <Text style={styles.sectionTitle}>饮水记录</Text>
        <WaterIntakeBar
          current={todayStats.waterIntake}
          target={todayStats.waterTarget}
          onAdd={handleWaterAdd}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  summaryCard: {
    backgroundColor: colors.light.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summaryTitle: {
    ...typography.bodyBold,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    ...typography.h2,
    color: '#FFFFFF',
  },
  summaryLabel: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.light.text,
    marginBottom: 12,
  },
})
