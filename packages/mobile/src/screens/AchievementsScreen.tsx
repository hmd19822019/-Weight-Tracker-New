import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, StyleSheet, Modal, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AchievementType } from '@weight-tracker/shared'
import { AchievementBadge } from '../components/AchievementBadge'
import { ACHIEVEMENT_DEFS, checkAchievements } from '../utils/achievementService'
import { colors, typography } from '../theme'
import { storage, STORAGE_KEYS } from '../utils/storage'

export const AchievementsScreen: React.FC = () => {
  console.log('[AchievementsScreen] Component mounting')
  const [unlocked, setUnlocked] = useState<AchievementType[]>([])
  const [newUnlock, setNewUnlock] = useState<AchievementType | null>(null)

  const loadAchievements = useCallback(async () => {
    const records = await storage.getItem<any[]>(STORAGE_KEYS.USER_DATA) || []
    const settings = await storage.getItem<any>(STORAGE_KEYS.SETTINGS) || {}
    const goal = settings.goal || null
    const current = checkAchievements(records, goal)

    const prev = await storage.getItem<AchievementType[]>('achievements') || []
    const newOnes = current.filter(a => !prev.includes(a))
    if (newOnes.length > 0) {
      await storage.setItem('achievements', current)
      setNewUnlock(newOnes[0])
    }
    setUnlocked(current)
  }, [])

  useEffect(() => {
    loadAchievements()
  }, [loadAchievements])

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summary}>
          <Text style={styles.summaryCount}>{unlocked.length}</Text>
          <Text style={styles.summaryLabel}>/ {ACHIEVEMENT_DEFS.length} 已解锁</Text>
        </View>

        <View style={styles.grid}>
          {ACHIEVEMENT_DEFS.map(def => (
            <AchievementBadge
              key={def.type}
              type={def.type}
              unlocked={unlocked.includes(def.type)}
              animate={newUnlock === def.type}
            />
          ))}
        </View>
      </ScrollView>

      <Modal visible={!!newUnlock} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>🎉 成就解锁！</Text>
            {newUnlock && (
              <>
                <Text style={styles.modalIcon}>
                  {ACHIEVEMENT_DEFS.find(d => d.type === newUnlock)?.icon}
                </Text>
                <Text style={styles.modalName}>
                  {ACHIEVEMENT_DEFS.find(d => d.type === newUnlock)?.title}
                </Text>
                <Text style={styles.modalDesc}>
                  {ACHIEVEMENT_DEFS.find(d => d.type === newUnlock)?.description}
                </Text>
              </>
            )}
            <TouchableOpacity style={styles.modalBtn} onPress={() => setNewUnlock(null)}>
              <Text style={styles.modalBtnText}>太棒了！</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.light.background },
  content: { padding: 16 },
  summary: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 24,
  },
  summaryCount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.light.primary,
  },
  summaryLabel: {
    ...typography.h3,
    color: colors.light.textSecondary,
    marginLeft: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: colors.light.background,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: 280,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.light.text,
    marginBottom: 16,
  },
  modalIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  modalName: {
    ...typography.h3,
    color: colors.light.text,
    marginBottom: 8,
  },
  modalDesc: {
    ...typography.body,
    color: colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalBtn: {
    backgroundColor: colors.light.primary,
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  modalBtnText: {
    ...typography.bodyBold,
    color: '#FFFFFF',
  },
})
