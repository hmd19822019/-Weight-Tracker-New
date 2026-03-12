import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { colors, typography } from '../theme'

interface WaterIntakeBarProps {
  current: number
  target: number
  onAdd: (amount: number) => void
}

export const WaterIntakeBar: React.FC<WaterIntakeBarProps> = ({
  current,
  target,
  onAdd,
}) => {
  const percentage = Math.min((current / target) * 100, 100)
  const quickAmounts = [200, 250, 500]

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>今日饮水</Text>
        <Text style={styles.amount}>
          {current} / {target} ml
        </Text>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${percentage}%` }]} />
      </View>

      <View style={styles.quickButtons}>
        {quickAmounts.map((amount) => (
          <TouchableOpacity
            key={amount}
            style={styles.quickButton}
            onPress={() => onAdd(amount)}
            activeOpacity={0.7}
          >
            <Text style={styles.quickButtonText}>+{amount}ml</Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    ...typography.bodyBold,
    color: colors.light.text,
  },
  amount: {
    ...typography.body,
    color: colors.light.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.light.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.light.primary,
    borderRadius: 4,
  },
  quickButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickButton: {
    flex: 1,
    backgroundColor: colors.light.background,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  quickButtonText: {
    ...typography.body,
    color: colors.light.primary,
  },
})
