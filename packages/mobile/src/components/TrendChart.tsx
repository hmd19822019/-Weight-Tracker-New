import React from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import { LineChart } from 'react-native-chart-kit'
import { predictWeight } from '@weight-tracker/shared'
import { colors, typography } from '../theme'

interface TrendChartProps {
  records: Array<{ date: Date; weight: number }>
}

const screenWidth = Dimensions.get('window').width

export const TrendChart: React.FC<TrendChartProps> = ({ records }) => {
  if (records.length < 2) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>趋势预测</Text>
        <Text style={styles.placeholder}>至少需要 2 条记录才能显示趋势预测</Text>
      </View>
    )
  }

  const sorted = [...records].sort((a, b) => a.date.getTime() - b.date.getTime())
  const last7 = sorted.slice(-7)

  const pred7 = predictWeight(sorted, 7)
  const pred14 = predictWeight(sorted, 14)
  const pred30 = predictWeight(sorted, 30)

  const labels = last7.map((r) => {
    const d = new Date(r.date)
    return `${d.getMonth() + 1}/${d.getDate()}`
  })
  const data = last7.map((r) => r.weight)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>趋势预测</Text>
      <LineChart
        data={{ labels, datasets: [{ data }] }}
        width={screenWidth - 64}
        height={160}
        chartConfig={{
          backgroundColor: colors.light.surface,
          backgroundGradientFrom: colors.light.surface,
          backgroundGradientTo: colors.light.surface,
          decimalPlaces: 1,
          color: () => colors.light.primary,
          labelColor: () => colors.light.textSecondary,
          propsForDots: { r: '4', strokeWidth: '2', stroke: colors.light.primary },
        }}
        bezier
        style={styles.chart}
      />
      <View style={styles.predictions}>
        {[
          { label: '7天后', value: pred7 },
          { label: '14天后', value: pred14 },
          { label: '30天后', value: pred30 },
        ].map(({ label, value }) => (
          <View key={label} style={styles.predItem}>
            <Text style={styles.predLabel}>{label}</Text>
            <Text style={styles.predValue}>
              {value !== null ? `${value.toFixed(1)}kg` : '--'}
            </Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.light.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    ...typography.bodyBold,
    color: colors.light.text,
    marginBottom: 12,
  },
  placeholder: {
    ...typography.body,
    color: colors.light.textSecondary,
    textAlign: 'center',
    paddingVertical: 16,
  },
  chart: {
    borderRadius: 8,
    marginHorizontal: -8,
  },
  predictions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  predItem: {
    alignItems: 'center',
  },
  predLabel: {
    ...typography.caption,
    color: colors.light.textSecondary,
  },
  predValue: {
    ...typography.bodyBold,
    color: colors.light.primary,
    marginTop: 2,
  },
})
