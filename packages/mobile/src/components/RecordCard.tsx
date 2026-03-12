import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { colors, typography } from '../theme'

interface RecordCardProps {
  id: string
  weight: number
  date: string
  notes?: string
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export const RecordCard: React.FC<RecordCardProps> = ({
  id,
  weight,
  date,
  notes,
  onEdit,
  onDelete,
}) => {
  const formattedDate = new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  const formattedTime = new Date(date).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <Text style={styles.weight}>{weight} kg</Text>
          <Text style={styles.date}>{formattedDate}</Text>
          <Text style={styles.time}>{formattedTime}</Text>
        </View>

        {notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notes} numberOfLines={2}>
              {notes}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onEdit(id)}
          activeOpacity={0.7}
        >
          <Text style={styles.actionText}>编辑</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => onDelete(id)}
          activeOpacity={0.7}
        >
          <Text style={[styles.actionText, styles.deleteText]}>删除</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.light.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  content: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  leftSection: {
    flex: 1,
  },
  weight: {
    ...typography.h2,
    color: colors.light.text,
    marginBottom: 4,
  },
  date: {
    ...typography.body,
    color: colors.light.text,
    marginBottom: 2,
  },
  time: {
    ...typography.caption,
    color: colors.light.textSecondary,
  },
  notesSection: {
    flex: 1,
    marginLeft: 12,
  },
  notes: {
    ...typography.caption,
    color: colors.light.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
    borderRadius: 6,
    marginHorizontal: 4,
    backgroundColor: colors.light.background,
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  actionText: {
    ...typography.body,
    color: colors.light.primary,
  },
  deleteText: {
    color: colors.light.error,
  },
})
