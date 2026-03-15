import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
} from 'react-native'
import { colors, typography } from '../theme'

interface WeightInputProps {
  onSubmit: (weight: number, date: Date, notes?: string) => void
  initialWeight?: number
}

function pad(n: number) {
  return n.toString().padStart(2, '0')
}

function formatDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = Array.from({ length: 60 }, (_, i) => i)

function buildDays(year: number, month: number) {
  const count = new Date(year, month + 1, 0).getDate()
  return Array.from({ length: count }, (_, i) => i + 1)
}

const MONTHS = Array.from({ length: 12 }, (_, i) => i)
const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

interface PickerColumnProps {
  items: number[]
  selected: number
  onSelect: (v: number) => void
  label?: (v: number) => string
}

const PickerColumn: React.FC<PickerColumnProps> = ({ items, selected, onSelect, label }) => (
  <ScrollView style={pickerStyles.column} showsVerticalScrollIndicator={false}>
    {items.map((item) => (
      <TouchableOpacity
        key={item}
        style={[pickerStyles.item, item === selected && pickerStyles.itemSelected]}
        onPress={() => onSelect(item)}
      >
        <Text style={[pickerStyles.itemText, item === selected && pickerStyles.itemTextSelected]}>
          {label ? label(item) : pad(item)}
        </Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
)

const pickerStyles = StyleSheet.create({
  column: { flex: 1, maxHeight: 200 },
  item: { paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
  itemSelected: { backgroundColor: colors.light.primary + '20' },
  itemText: { ...typography.body, color: colors.light.textSecondary },
  itemTextSelected: { color: colors.light.primary, fontWeight: '600' },
})

export const WeightInput: React.FC<WeightInputProps> = ({ onSubmit, initialWeight }) => {
  const now = new Date()
  const [weight, setWeight] = useState(initialWeight?.toString() || '')
  const [notes, setNotes] = useState('')
  const [showPicker, setShowPicker] = useState(false)
  const [selYear, setSelYear] = useState(now.getFullYear())
  const [selMonth, setSelMonth] = useState(now.getMonth())
  const [selDay, setSelDay] = useState(now.getDate())
  const [selHour, setSelHour] = useState(now.getHours())
  const [selMin, setSelMin] = useState(now.getMinutes())

  const selectedDate = new Date(selYear, selMonth, selDay, selHour, selMin)
  const days = buildDays(selYear, selMonth)

  const handleSubmit = () => {
    const weightNum = parseFloat(weight)
    if (isNaN(weightNum) || weightNum <= 0) {
      Alert.alert('错误', '请输入有效的体重值')
      return
    }
    if (weightNum < 20 || weightNum > 300) {
      Alert.alert('错误', `体重 ${weightNum}kg 超出范围（20-300kg），请重新输入`)
      return
    }
    onSubmit(weightNum, selectedDate, notes || undefined)
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
        placeholder="输入体重，如 70.5"
        placeholderTextColor={colors.light.textSecondary}
      />

      <Text style={styles.label}>记录时间</Text>
      <TouchableOpacity style={styles.dateButton} onPress={() => setShowPicker(true)}>
        <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
        <Text style={styles.dateIcon}>📅</Text>
      </TouchableOpacity>

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

      <TouchableOpacity style={styles.button} onPress={handleSubmit} activeOpacity={0.7}>
        <Text style={styles.buttonText}>记录体重</Text>
      </TouchableOpacity>

      <Modal visible={showPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>选择日期时间</Text>
            <View style={styles.pickerRow}>
              <View style={styles.pickerGroup}>
                <Text style={styles.pickerLabel}>年</Text>
                <PickerColumn items={YEARS} selected={selYear} onSelect={setSelYear} label={(v) => v.toString()} />
              </View>
              <View style={styles.pickerGroup}>
                <Text style={styles.pickerLabel}>月</Text>
                <PickerColumn items={MONTHS} selected={selMonth} onSelect={setSelMonth} label={(v) => pad(v + 1)} />
              </View>
              <View style={styles.pickerGroup}>
                <Text style={styles.pickerLabel}>日</Text>
                <PickerColumn items={days} selected={selDay} onSelect={setSelDay} label={(v) => pad(v)} />
              </View>
              <View style={styles.pickerGroup}>
                <Text style={styles.pickerLabel}>时</Text>
                <PickerColumn items={HOURS} selected={selHour} onSelect={setSelHour} />
              </View>
              <View style={styles.pickerGroup}>
                <Text style={styles.pickerLabel}>分</Text>
                <PickerColumn items={MINUTES} selected={selMin} onSelect={setSelMin} />
              </View>
            </View>
            <TouchableOpacity style={styles.confirmButton} onPress={() => setShowPicker(false)}>
              <Text style={styles.confirmText}>确认</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  dateButton: {
    backgroundColor: colors.light.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.light.border,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: colors.light.text,
  },
  dateIcon: {
    fontSize: 18,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.light.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.light.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 4,
  },
  pickerGroup: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabel: {
    ...typography.caption,
    color: colors.light.textSecondary,
    marginBottom: 4,
  },
  confirmButton: {
    backgroundColor: colors.light.primary,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  confirmText: {
    ...typography.bodyBold,
    color: '#FFFFFF',
  },
})
