import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, typography } from '../theme'

interface SyncStatusProps {
  isOnline: boolean
  isSyncing?: boolean
  lastSyncTime?: Date
}

export const SyncStatus: React.FC<SyncStatusProps> = ({
  isOnline,
  isSyncing,
  lastSyncTime,
}) => {
  const getStatusText = () => {
    if (isSyncing) return '同步中...'
    if (!isOnline) return '离线'
    if (lastSyncTime) {
      const now = new Date()
      const diff = now.getTime() - lastSyncTime.getTime()
      const minutes = Math.floor(diff / 60000)
      if (minutes < 1) return '刚刚同步'
      if (minutes < 60) return `${minutes}分钟前同步`
      const hours = Math.floor(minutes / 60)
      if (hours < 24) return `${hours}小时前同步`
      return '超过1天未同步'
    }
    return '未同步'
  }

  const getStatusColor = () => {
    if (isSyncing) return colors.light.primary
    if (!isOnline) return colors.light.textSecondary
    if (lastSyncTime) {
      const now = new Date()
      const diff = now.getTime() - lastSyncTime.getTime()
      if (diff < 3600000) return colors.light.success // < 1 hour
      return colors.light.warning
    }
    return colors.light.textSecondary
  }

  return (
    <View style={styles.container}>
      <View style={[styles.indicator, { backgroundColor: getStatusColor() }]} />
      <Text style={styles.text}>{getStatusText()}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.light.surface,
    borderRadius: 12,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  text: {
    ...typography.caption,
    color: colors.light.textSecondary,
  },
})
