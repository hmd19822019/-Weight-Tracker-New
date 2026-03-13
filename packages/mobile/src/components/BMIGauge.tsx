import React from 'react'
import { View, Text, StyleSheet, TextInput } from 'react-native'
import { calculateBMI, calculateBMICategory, BMICategory } from '@weight-tracker/shared'
import { colors, typography } from '../theme'

interface BMIGaugeProps {
  weight: number
  height: number
  onHeightChange?: (height: number) => void
}

const BMI_LABELS: Record<BMICategory, string> = {
  underweight: '偏瘦',
  normal: '正常',
  overweight: '偏重',
  obese: '肥胖',
}

const BMI_COLORS: Record<BMICategory, string> = {
  underweight: '#5AC8FA',
  normal: '#34C759',
  overweight: '#FF9500',
  obese: '#FF3B30',
}

export const BMIGauge: React.FC<BMIGaugeProps> = ({ weight, height, onHeightChange }) => {
  const [inputHeight, setInputHeight] = React.useState(height > 0 ? String(height) : '')

  const currentHeight = parseFloat(inputHeight) || 0
  const bmi = currentHeight > 0 && weight > 0 ? calculateBMI(weight, currentHeight) : null
  const category = bmi ? calculateBMICategory(bmi) : null

  const handleHeightChange = (text: string) => {
    setInputHeight(text)
    const h = parseFloat(text)
    if (h > 0 && onHeightChange) onHeightChange(h)
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>身高 (cm)</Text>
        <TextInput
          style={styles.input}
          value={inputHeight}
          onChangeText={handleHeightChange}
          keyboardType="numeric"
          placeholder="请输入身高"
          placeholderTextColor={colors.light.textSecondary}
        />
      </View>

      {bmi && category ? (
        <View style={styles.result}>
          <Text style={[styles.bmiValue, { color: BMI_COLORS[category] }]}>
            {bmi.toFixed(1)}
          </Text>
          <Text style={[styles.categoryLabel, { color: BMI_COLORS[category] }]}>
            {BMI_LABELS[category]}
          </Text>
          <View style={styles.gauge}>
            {(['underweight', 'normal', 'overweight', 'obese'] as BMICategory[]).map((cat) => (
              <View
                key={cat}
                style={[
                  styles.gaugeSegment,
                  { backgroundColor: BMI_COLORS[cat] },
                  category === cat && styles.gaugeSegmentActive,
                ]}
              />
            ))}
          </View>
          <View style={styles.gaugeLabels}>
            <Text style={styles.gaugeLabel}>偏瘦</Text>
            <Text style={styles.gaugeLabel}>正常</Text>
            <Text style={styles.gaugeLabel}>偏重</Text>
            <Text style={styles.gaugeLabel}>肥胖</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.placeholder}>请输入身高以计算 BMI</Text>
      )}
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    ...typography.body,
    color: colors.light.text,
  },
  input: {
    ...typography.body,
    color: colors.light.text,
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    width: 100,
    textAlign: 'center',
  },
  result: {
    alignItems: 'center',
  },
  bmiValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  categoryLabel: {
    ...typography.bodyBold,
    marginBottom: 12,
  },
  gauge: {
    flexDirection: 'row',
    width: '100%',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 4,
  },
  gaugeSegment: {
    flex: 1,
    opacity: 0.4,
  },
  gaugeSegmentActive: {
    opacity: 1,
  },
  gaugeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  gaugeLabel: {
    ...typography.caption,
    color: colors.light.textSecondary,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    ...typography.body,
    color: colors.light.textSecondary,
    textAlign: 'center',
    paddingVertical: 16,
  },
})
