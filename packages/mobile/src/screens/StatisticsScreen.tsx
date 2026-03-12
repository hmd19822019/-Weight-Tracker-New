import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors } from '../theme'

export const StatisticsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>统计分析</Text>
      <Text style={styles.subtitle}>查看您的体重趋势和统计数据</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.light.textSecondary,
  },
})
