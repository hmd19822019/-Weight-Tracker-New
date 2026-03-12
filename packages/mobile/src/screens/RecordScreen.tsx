import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors } from '../theme'

export const RecordScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>体重记录</Text>
      <Text style={styles.subtitle}>记录您的体重和饮水量</Text>
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
