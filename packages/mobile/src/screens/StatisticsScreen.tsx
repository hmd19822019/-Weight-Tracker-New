import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LineChart } from 'react-native-chart-kit'
import { StatCard } from '../components/StatCard'
import { colors, typography } from '../theme'
import { storage, STORAGE_KEYS } from '../utils/storage'

interface WeightRecord {
  id: string
  weight: number
  date: string
}

interface Stats {
  current: number | null
  min: number | null
  max: number | null
  avg: number | null
  change: number | null
  count: number
}

const screenWidth = Dimensions.get('window').width

export const StatisticsScreen = () => {
  const [records, setRecords] = useState<WeightRecord[]>([])
  const [stats, setStats] = useState<Stats>({
    current: null,
    min: null,
    max: null,
    avg: null,
    change: null,
    count: 0,
  })

  const loadData = useCallback(async () => {
    try {
      const data = await storage.getItem<WeightRecord[]>(STORAGE_KEYS.USER_DATA) || []
      const sorted = data.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )
      setRecords(sorted)

      if (sorted.length > 0) {
        const weights = sorted.map((r) => r.weight)
        const current = weights[weights.length - 1]
        const first = weights[0]
        setStats({
          current,
          min: Math.min(...weights),
          max: Math.max(...weights),
          avg: parseFloat(
            (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1)
          ),
          change: parseFloat((current - first).toFixed(1)),
          count: sorted.length,
        })
      }
    } catch (error) {
      console.error('Failed to load statistics data', error)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const chartData = records.slice(-14) // Last 14 records
  const hasChartData = chartData.length >= 2

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="当前体重"
            value={stats.current ? `${stats.current}kg` : '--'}
          />
          <StatCard
            title="变化量"
            value={
              stats.change !== null
                ? `${stats.change > 0 ? '+' : ''}${stats.change}kg`
                : '--'
            }
            color={
              stats.change === null
                ? colors.light.primary
                : stats.change > 0
                ? colors.light.error
                : colors.light.success
            }
          />
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            title="最低体重"
            value={stats.min ? `${stats.min}kg` : '--'}
            color={colors.light.success}
          />
          <StatCard
            title="最高体重"
            value={stats.max ? `${stats.max}kg` : '--'}
            color={colors.light.error}
          />
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            title="平均体重"
            value={stats.avg ? `${stats.avg}kg` : '--'}
          />
          <StatCard
            title="记录次数"
            value={`${stats.count}次`}
          />
        </View>

        {/* Chart */}
        <Text style={styles.sectionTitle}>体重趋势</Text>
        {hasChartData ? (
          <View style={styles.chartContainer}>
            <LineChart
              data={{
                labels: chartData.map((r) =>
                  new Date(r.date).toLocaleDateString('zh-CN', {
                    month: '2-digit',
                    day: '2-digit',
                  })
                ),
                datasets: [{ data: chartData.map((r) => r.weight) }],
              }}
              width={screenWidth - 32}
              height={220}
              chartConfig={{
                backgroundColor: colors.light.surface,
                backgroundGradientFrom: colors.light.surface,
                backgroundGradientTo: colors.light.surface,
                decimalPlaces: 1,
                color: () => colors.light.primary,
                labelColor: () => colors.light.textSecondary,
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: colors.light.primary,
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>
        ) : (
          <View style={styles.emptyChart}>
            <Text style={styles.emptyText}>
              至少需要 2 条记录才能显示趋势图
            </Text>
          </View>
        )}
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
  statsGrid: {
    flexDirection: 'row',
    marginHorizontal: -6,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.light.text,
    marginBottom: 12,
    marginTop: 8,
  },
  chartContainer: {
    backgroundColor: colors.light.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  chart: {
    borderRadius: 12,
  },
  emptyChart: {
    backgroundColor: colors.light.surface,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.light.textSecondary,
    textAlign: 'center',
  },
})
