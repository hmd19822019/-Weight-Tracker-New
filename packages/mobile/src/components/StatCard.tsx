import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, typography } from '../theme'

interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  color?: string
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  color = colors.light.primary,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.light.surface,
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 6,
    marginBottom: 12,
  },
  title: {
    ...typography.caption,
    color: colors.light.textSecondary,
    marginBottom: 8,
  },
  value: {
    ...typography.h2,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.small,
    color: colors.light.textSecondary,
  },
})
