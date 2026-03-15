import React, { useState, useCallback, useEffect } from 'react'
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Image,
} from 'react-native'

import { colors, typography } from '../theme'
import { storage, STORAGE_KEYS } from '../utils/storage'

interface FoodRecord {
  id: string
  name: string
  calories: number
  date: string
  photoUri?: string
  confidence?: number
}

const CALORIE_TARGET = 2000

export const FoodScreen: React.FC = () => {
  console.log('[FoodScreen] Component mounting')
  const [records, setRecords] = useState<FoodRecord[]>([])
  const [name, setName] = useState('')
  const [calories, setCalories] = useState('')
  const [recognizing, setRecognizing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [photoUri, setPhotoUri] = useState<string | null>(null)

  const todayKey = new Date().toISOString().split('T')[0]

  const loadRecords = useCallback(async () => {
    const all = await storage.getItem<FoodRecord[]>('food_records') || []
    const today = all.filter(r => r.date.startsWith(todayKey))
    setRecords(today)
  }, [todayKey])

  useEffect(() => {
    loadRecords()
  }, [loadRecords])

  const totalCalories = records.reduce((sum, r) => sum + r.calories, 0)
  const progress = Math.min(totalCalories / CALORIE_TARGET, 1)

  const handleRecognize = useCallback(async () => {
    Alert.alert(
      '选择图片',
      '请选择图片来源',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '拍照',
          onPress: async () => {
            Alert.alert('提示', '相机功能需要在真机上使用')
          },
        },
        {
          text: '从相册选择',
          onPress: async () => {
            Alert.alert('提示', '相册功能需要在真机上使用')
          },
        },
      ]
    )
  }, [])

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert('提示', '请输入食物名称')
      return
    }
    const cal = parseInt(calories)
    if (isNaN(cal) || cal <= 0) {
      Alert.alert('提示', '请输入有效的卡路里数值')
      return
    }

    setSaving(true)
    try {
      const all = await storage.getItem<FoodRecord[]>('food_records') || []
      const newRecord: FoodRecord = {
        id: Date.now().toString(),
        name: name.trim(),
        calories: cal,
        date: new Date().toISOString(),
        photoUri: photoUri || undefined,
      }
      await storage.setItem('food_records', [...all, newRecord])
      setName('')
      setCalories('')
      setPhotoUri(null)
      await loadRecords()
      Alert.alert('成功', `已记录 ${name} (${cal} kcal)`)
    } finally {
      setSaving(false)
    }
  }, [name, calories, photoUri, loadRecords])

  const handleDelete = useCallback(async (id: string) => {
    const all = await storage.getItem<FoodRecord[]>('food_records') || []
    await storage.setItem('food_records', all.filter(r => r.id !== id))
    await loadRecords()
  }, [loadRecords])

  return (
    <View style={styles.safeArea} >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* 今日卡路里进度 */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>今日卡路里</Text>
          <Text style={styles.calorieValue}>{totalCalories} <Text style={styles.calorieUnit}>/ {CALORIE_TARGET} kcal</Text></Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: progress > 0.9 ? colors.light.warning : colors.light.success }]} />
          </View>
        </View>

        {/* AI 识别按钮 */}
        <TouchableOpacity style={styles.recognizeBtn} onPress={handleRecognize} disabled={recognizing}>
          {recognizing
            ? <ActivityIndicator color="#FFFFFF" />
            : <Text style={styles.recognizeBtnText}>📷 拍照识别食物</Text>
          }
        </TouchableOpacity>

        {/* 手动输入 */}
        <View style={styles.inputCard}>
          <Text style={styles.inputTitle}>手动记录</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="食物名称"
            placeholderTextColor={colors.light.textSecondary}
          />
          <TextInput
            style={styles.input}
            value={calories}
            onChangeText={setCalories}
            placeholder="卡路里 (kcal)"
            placeholderTextColor={colors.light.textSecondary}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
            {saving
              ? <ActivityIndicator color="#FFFFFF" />
              : <Text style={styles.saveBtnText}>记录</Text>
            }
          </TouchableOpacity>
        </View>

        {/* 今日记录列表 */}
        {records.length > 0 && (
          <View style={styles.listCard}>
            <Text style={styles.listTitle}>今日记录</Text>
            {records.map(r => (
              <View key={r.id} style={styles.recordRow}>
                <View style={styles.recordInfo}>
                  <Text style={styles.recordName}>{r.name}</Text>
                  <Text style={styles.recordCalories}>{r.calories} kcal</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(r.id)}>
                  <Text style={styles.deleteBtn}>删除</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.light.background },
  content: { padding: 16 },
  summaryCard: {
    backgroundColor: colors.light.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  summaryTitle: { ...typography.bodyBold, color: '#FFFFFF', marginBottom: 4 },
  calorieValue: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 12 },
  calorieUnit: { ...typography.body, color: 'rgba(255,255,255,0.8)' },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4 },
  recognizeBtn: {
    backgroundColor: colors.light.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  recognizeBtnText: { ...typography.bodyBold, color: '#FFFFFF' },
  inputCard: {
    backgroundColor: colors.light.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  inputTitle: { ...typography.bodyBold, color: colors.light.text, marginBottom: 12 },
  input: {
    ...typography.body,
    color: colors.light.text,
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  saveBtn: {
    backgroundColor: colors.light.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  saveBtnText: { ...typography.bodyBold, color: '#FFFFFF' },
  listCard: {
    backgroundColor: colors.light.surface,
    borderRadius: 12,
    padding: 16,
  },
  listTitle: { ...typography.bodyBold, color: colors.light.text, marginBottom: 12 },
  recordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  recordInfo: { flex: 1 },
  recordName: { ...typography.body, color: colors.light.text },
  recordCalories: { ...typography.caption, color: colors.light.textSecondary },
  deleteBtn: { ...typography.caption, color: colors.light.error || '#FF3B30' },
})
