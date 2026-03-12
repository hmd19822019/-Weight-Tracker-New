import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native'
import { colors, typography } from '../theme'

interface WeightInputProps {
  onSubmit: (weight: number, date: Date, notes?: string) => void
  initialWeight?: number
}

export const WeightInput: React.FC<WeightInputProps> = ({
  onSubmit,
  initialWeight,
}) => {
  const [weight, setWeight] = useState(initialWeight?.toString() || '')
  const [notes, setNotes] = useState('')

  const handleSubmit = () => {
    const weightNum = parseFloat(weight)

    if (isNaN(weightNum) || weightNum <= 0) {
      Alert.alert('错误', '请输入有效的体重值')
      return
    }

    if (weightNum < 20 || weightNum > 300) {
      Alert.alert('警告', '体重值似乎不在正常范围内，请确认')
      return
    }

    onSubmit(weightNum, new Date(), notes || undefined)
    setWeight('')
    setNotes('')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>体重 (kg)</Text>
      <TextInput
        style={styles.input}
        value={weight}
        onChangeText={setWeight}
        keyboardType="decimal-pad"
        placeholder="输入体重"
        placeholderTextColor={colors.light.textSecondary}
      />

      <Text style={styles.label}>备注（可选）</Text>
      <TextInput
        style={[styles.input, styles.notesInput]}
        value={notes}
        onChangeText={setNotes}
        placeholder="添加备注..."
        placeholderTextColor={colors.light.textSecondary}
        multiline
        numberOfLines={3}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>记录体重</Text>
      </TouchableOpacity>
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
  label: {
    ...typography.bodyBold,
    color: colors.light.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.light.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.light.text,
    borderWidth: 1,
    borderColor: colors.light.border,
    marginBottom: 16,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: colors.light.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    ...typography.bodyBold,
    color: '#FFFFFF',
  },
})
