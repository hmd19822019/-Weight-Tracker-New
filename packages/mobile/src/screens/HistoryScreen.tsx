import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors } from '../theme'

export const HistoryScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>历史记录</Text>
      <Text style={styles.subtitle}>查看和管理您的体重记录</Text>
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
