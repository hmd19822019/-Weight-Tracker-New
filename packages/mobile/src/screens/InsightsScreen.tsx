import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BMIGauge } from '../components/BMIGauge'
// import { TrendChart } from '../components/TrendChart'
import { colors, typography } from '../theme'
import { storage, STORAGE_KEYS } from '../utils/storage'

interface WeightRecord {
  id: string
  weight: number
  date: string
  notes?: string
}

interface HealthTip {
  icon: string
  text: string
}

function getHealthTips(records: WeightRecord[]): HealthTip[] {
  const tips: HealthTip[] = []
  if (records.length === 0) {
    tips.push({ icon: '📝', text: '开始记录体重，追踪你的健康变化' })
    return tips
  }

  const sorted = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const latest = sorted[0].weight

  if (records.length >= 7) {
    const weekAgo = sorted[Math.min(6, sorted.length - 1)].weight
    const change = latest - weekAgo
    if (change < -0.5) tips.push({ icon: '📉', text: `本周体重下降 ${Math.abs(change).toFixed(1)}kg，继续保持！` })
    else if (change > 0.5) tips.push({ icon: '📈', text: `本周体重上升 ${change.toFixed(1)}kg，注意饮食和运动` })
    else tips.push({ icon: '✅', text: '本周体重保持稳定，状态良好' })
  }

  if (records.length >= 2) {
    tips.push({ icon: '💧', text: '每天保持充足饮水，有助于新陈代谢' })
    tips.push({ icon: '🏃', text: '坚持规律运动，每周至少 150 分钟中等强度运动' })
  }

  if (latest > 80) tips.push({ icon: '🥗', text: '建议增加蔬菜摄入，减少高热量食物' })
  else if (latest < 50) tips.push({ icon: '🍚', text: '注意保证充足的营养摄入' })

  return tips.slice(0, 3)
}

export const InsightsScreen: React.FC = () => {
  console.log('[InsightsScreen] Component mounting')
  const [records, setRecords] = useState<WeightRecord[]>([])
  const [height, setHeight] = useState(0)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await storage.getItem<WeightRecord[]>(STORAGE_KEYS.USER_DATA) || []
      setRecords(data)
      const settings = await storage.getItem<any>(STORAGE_KEYS.SETTINGS) || {}
      if (settings.height) setHeight(settings.height)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleHeightChange = useCallback(async (h: number) => {
    setHeight(h)
    const settings = await storage.getItem<any>(STORAGE_KEYS.SETTINGS) || {}
    await storage.setItem(STORAGE_KEYS.SETTINGS, { ...settings, height: h })
  }, [])

  const latestWeight = records.length > 0
    ? [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].weight
    : 0

  const chartRecords = records.map(r => ({ date: new Date(r.date), weight: r.weight }))
  const tips = getHealthTips(records)

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.light.primary} />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>BMI 分析</Text>
        <BMIGauge weight={latestWeight} height={height} onHeightChange={handleHeightChange} />

        <Text style={styles.sectionTitle}>体重趋势</Text>
        <View style={styles.tipsCard}>
          <Text style={styles.tipText}>图表功能开发中...</Text>
        </View>

        <Text style={styles.sectionTitle}>健康建议</Text>
        <View style={styles.tipsCard}>
          {tips.map((tip, i) => (
            <View key={i} style={[styles.tipRow, i < tips.length - 1 && styles.tipBorder]}>
              <Text style={styles.tipIcon}>{tip.icon}</Text>
              <Text style={styles.tipText}>{tip.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.light.background },
  container: { flex: 1 },
  content: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: {
    ...typography.h3,
    color: colors.light.text,
    marginBottom: 12,
  },
  tipsCard: {
    backgroundColor: colors.light.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
  },
  tipBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  tipIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  tipText: {
    ...typography.body,
    color: colors.light.text,
    flex: 1,
    lineHeight: 22,
  },
})
