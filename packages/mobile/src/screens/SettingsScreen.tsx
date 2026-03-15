import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, typography } from '../theme'
import { storage, STORAGE_KEYS } from '../utils/storage'

interface SettingsScreenProps {
  onLogout: () => void
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onLogout }) => {
  const [darkMode, setDarkMode] = useState(false)
  const [autoSync, setAutoSync] = useState(true)

  const handleDarkModeToggle = useCallback(async (value: boolean) => {
    setDarkMode(value)
    await storage.setItem(STORAGE_KEYS.THEME, value ? 'dark' : 'light')
    Alert.alert('提示', '深色模式将在下次启动时生效')
  }, [])

  const handleAutoSyncToggle = useCallback(async (value: boolean) => {
    setAutoSync(value)
    const settings = await storage.getItem<any>(STORAGE_KEYS.SETTINGS) || {}
    await storage.setItem(STORAGE_KEYS.SETTINGS, { ...settings, autoSync: value })
  }, [])

  const handleLogout = useCallback(() => {
    Alert.alert(
      '确认退出',
      '退出后本地数据将保留，下次登录可继续使用',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '退出',
          style: 'destructive',
          onPress: async () => {
            await storage.removeItem(STORAGE_KEYS.USER_TOKEN)
            onLogout()
          },
        },
      ]
    )
  }, [onLogout])

  const handleClearData = useCallback(() => {
    Alert.alert(
      '确认清除',
      '此操作将删除所有本地数据，且无法恢复',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '清除',
          style: 'destructive',
          onPress: async () => {
            await storage.clear()
            Alert.alert('成功', '数据已清除', [
              { text: '确定', onPress: onLogout },
            ])
          },
        },
      ]
    )
  }, [onLogout])

  return (
    <SafeAreaView style={styles.safeArea} >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>外观</Text>
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>深色模式</Text>
            <Switch
              value={darkMode}
              onValueChange={handleDarkModeToggle}
              trackColor={{
                false: colors.light.border,
                true: colors.light.primary,
              }}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>数据</Text>
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>自动同步</Text>
            <Switch
              value={autoSync}
              onValueChange={handleAutoSyncToggle}
              trackColor={{
                false: colors.light.border,
                true: colors.light.primary,
              }}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>账户</Text>
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Text style={styles.actionText}>退出登录</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleClearData}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionText, styles.dangerText]}>
              清除所有数据
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.version}>版本 1.0.0</Text>
          <Text style={styles.copyright}>© 2026 体重追踪助手</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.light.textSecondary,
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 4,
  },
  section: {
    backgroundColor: colors.light.surface,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingLabel: {
    ...typography.body,
    color: colors.light.text,
  },
  actionRow: {
    padding: 16,
  },
  actionText: {
    ...typography.body,
    color: colors.light.primary,
  },
  dangerText: {
    color: colors.light.error,
  },
  divider: {
    height: 1,
    backgroundColor: colors.light.border,
    marginHorizontal: 16,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  version: {
    ...typography.caption,
    color: colors.light.textSecondary,
    marginBottom: 4,
  },
  copyright: {
    ...typography.small,
    color: colors.light.textSecondary,
  },
})
