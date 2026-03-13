import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated } from 'react-native'
import { AchievementType } from '@weight-tracker/shared'
import { ACHIEVEMENT_DEFS } from '../utils/achievementService'
import { colors, typography } from '../theme'

interface AchievementBadgeProps {
  type: AchievementType
  unlocked: boolean
  animate?: boolean
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({ type, unlocked, animate }) => {
  const scale = useRef(new Animated.Value(1)).current
  const def = ACHIEVEMENT_DEFS.find(d => d.type === type)

  useEffect(() => {
    if (animate && unlocked) {
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.3, duration: 200, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start()
    }
  }, [animate, unlocked, scale])

  if (!def) return null

  return (
    <Animated.View style={[styles.container, !unlocked && styles.locked, { transform: [{ scale }] }]}>
      <Text style={[styles.icon, !unlocked && styles.lockedIcon]}>{def.icon}</Text>
      <Text style={[styles.title, !unlocked && styles.lockedText]} numberOfLines={1}>{def.title}</Text>
      <Text style={[styles.desc, !unlocked && styles.lockedText]} numberOfLines={2}>{def.description}</Text>
      {!unlocked && <View style={styles.lockOverlay}><Text style={styles.lockIcon}>🔒</Text></View>}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 100,
    alignItems: 'center',
    backgroundColor: colors.light.surface,
    borderRadius: 12,
    padding: 12,
    margin: 6,
    borderWidth: 2,
    borderColor: colors.light.primary,
  },
  locked: {
    borderColor: colors.light.border,
    opacity: 0.6,
  },
  icon: {
    fontSize: 32,
    marginBottom: 6,
  },
  lockedIcon: {
    opacity: 0.4,
  },
  title: {
    ...typography.caption,
    fontWeight: 'bold',
    color: colors.light.text,
    textAlign: 'center',
    marginBottom: 2,
  },
  desc: {
    ...typography.caption,
    color: colors.light.textSecondary,
    textAlign: 'center',
    fontSize: 10,
  },
  lockedText: {
    color: colors.light.textSecondary,
  },
  lockOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  lockIcon: {
    fontSize: 12,
  },
})
