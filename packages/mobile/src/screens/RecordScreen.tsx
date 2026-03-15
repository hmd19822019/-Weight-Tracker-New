import React, { useState, useCallback, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native'
import { WeightInput } from '../components/WeightInput'
import { WaterIntakeBar } from '../components/WaterIntakeBar'
import { SyncStatus } from '../components/SyncStatus'
import { colors, typography } from '../theme'
import { storage, STORAGE_KEYS } from '../utils/storage'
import { useNetworkStatus } from '../utils/useNetworkStatus'
import { syncService } from '../utils/syncService'

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
  const [syncing, setSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date>()
  const { isOnline } = useNetworkStatus()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const settings = await storage.getItem<any>(STORAGE_KEYS.SETTINGS) || {}
    if (settings.autoSync && isOnline) {
      handleSync()
    }
  }

  const handleSync = useCallback(async () => {
    if (!isOnline) {
      Alert.alert('提示', '当前离线，无法同步')
      return
    }

    setSyncing(true)
    try {
      const result = await syncService.fullSync()
      if (result.success) {
        setLastSyncTime(new Date())
      }
      Alert.alert(result.success ? '成功' : '失败', result.message)
    } catch (error) {
      Alert.alert('错误', '同步失败')
    } finally {
      setSyncing(false)
    }
  }, [isOnline])

  const handleWeightSubmit = useCallback(
    async (weight: number, date: Date, notes?: string) => {
      setSaving(true)
      try {
        console.log('[RecordScreen] Starting weight submission:', { weight, date, notes })

        // Load existing records
        console.log('[RecordScreen] Loading existing records...')
        const existing = await storage.getItem<any[]>(STORAGE_KEYS.USER_DATA) || []
        console.log('[RecordScreen] Existing records count:', existing.length)

        const newRecord = {
          id: Date.now().toString(),
          weight,
          date: date.toISOString(),
          notes,
          syncStatus: 'local',
        }
        console.log('[RecordScreen] Saving new record:', newRecord)

        await storage.setItem(STORAGE_KEYS.USER_DATA, [...existing, newRecord])
        console.log('[RecordScreen] Record saved successfully')

        setTodayStats((prev) => ({ ...prev, lastWeight: weight }))
        Alert.alert('成功', `体重 ${weight}kg 已记录`)
      } catch (error) {
        console.error('[RecordScreen] Failed to save weight record:', error)
        const errorMessage = error instanceof Error ? error.message : String(error)
        Alert.alert(
          '记录失败',
          `保存失败，请重试\n\n错误详情：${errorMessage}`,
          [{ text: '确定' }]
        )
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
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📝 记录</Text>
      </View>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Sync status bar */}
        <View style={styles.syncBar}>
          <SyncStatus
            isOnline={!!isOnline}
            isSyncing={syncing}
            lastSyncTime={lastSyncTime}
          />
          <TouchableOpacity
            style={styles.syncButton}
            onPress={handleSync}
            disabled={syncing || !isOnline}
            activeOpacity={0.7}
          >
            {syncing ? (
              <ActivityIndicator size="small" color={colors.light.primary} />
            ) : (
              <Text style={styles.syncButtonText}>同步</Text>
            )}
          </TouchableOpacity>
        </View>

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
    </View>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.light.text,
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
  syncBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  syncButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: colors.light.surface,
    borderRadius: 12,
    minWidth: 56,
    alignItems: 'center',
  },
  syncButtonText: {
    ...typography.caption,
    color: colors.light.primary,
  },
})
