import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native'

import { RecordCard } from '../components/RecordCard'
import { colors, typography } from '../theme'
import { storage, STORAGE_KEYS } from '../utils/storage'

interface WeightRecord {
  id: string
  weight: number
  date: string
  notes?: string
  syncStatus: string
}

export const HistoryScreen = () => {
  const [records, setRecords] = useState<WeightRecord[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const loadRecords = useCallback(async () => {
    try {
      const data = await storage.getItem<WeightRecord[]>(STORAGE_KEYS.USER_DATA) || []
      // Sort by date descending
      const sorted = data.sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      setRecords(sorted)
    } catch (error) {
      Alert.alert('错误', '加载记录失败')
    }
  }, [])

  useEffect(() => {
    loadRecords()
  }, [loadRecords])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadRecords()
    setRefreshing(false)
  }, [loadRecords])

  const handleEdit = useCallback((id: string) => {
    Alert.alert('编辑', '编辑功能即将推出')
  }, [])

  const handleDelete = useCallback(
    async (id: string) => {
      Alert.alert(
        '确认删除',
        '确定要删除这条记录吗？',
        [
          { text: '取消', style: 'cancel' },
          {
            text: '删除',
            style: 'destructive',
            onPress: async () => {
              try {
                const filtered = records.filter((r) => r.id !== id)
                await storage.setItem(STORAGE_KEYS.USER_DATA, filtered)
                setRecords(filtered)
                Alert.alert('成功', '记录已删除')
              } catch (error) {
                Alert.alert('错误', '删除失败')
              }
            },
          },
        ]
      )
    },
    [records]
  )

  const renderItem = useCallback(
    ({ item }: { item: WeightRecord }) => (
      <RecordCard
        id={item.id}
        weight={item.weight}
        date={item.date}
        notes={item.notes}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    ),
    [handleEdit, handleDelete]
  )

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>暂无记录</Text>
      <Text style={styles.emptySubtext}>
        在"记录"页面添加您的第一条体重记录
      </Text>
    </View>
  )

  return (
    <View style={styles.safeArea} >
      <FlatList
        data={records}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.light.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    ...typography.h3,
    color: colors.light.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.light.textSecondary,
    textAlign: 'center',
  },
})
