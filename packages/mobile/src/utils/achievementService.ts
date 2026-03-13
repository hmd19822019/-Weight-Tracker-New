import { AchievementType } from '@weight-tracker/shared'

export interface AchievementDef {
  type: AchievementType
  title: string
  description: string
  icon: string
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  { type: 'first_record', title: '初次记录', description: '完成第一次体重记录', icon: '🌟' },
  { type: 'records_10', title: '坚持不懈', description: '累计记录 10 次', icon: '💪' },
  { type: 'records_50', title: '习惯养成', description: '累计记录 50 次', icon: '🏆' },
  { type: 'records_100', title: '百日坚持', description: '累计记录 100 次', icon: '👑' },
  { type: 'streak_7', title: '连续一周', description: '连续 7 天记录体重', icon: '🔥' },
  { type: 'streak_30', title: '月度达人', description: '连续 30 天记录体重', icon: '⚡' },
  { type: 'goal_achieved', title: '目标达成', description: '达到目标体重', icon: '🎯' },
]

interface WeightRecord {
  id: string
  weight: number
  date: string
}

interface UserGoal {
  targetWeight: number
  isActive: boolean
}

export function checkAchievements(
  records: WeightRecord[],
  goal?: UserGoal | null
): AchievementType[] {
  const unlocked: AchievementType[] = []

  if (records.length === 0) return unlocked

  // first_record
  if (records.length >= 1) unlocked.push('first_record')

  // records_10, 50, 100
  if (records.length >= 10) unlocked.push('records_10')
  if (records.length >= 50) unlocked.push('records_50')
  if (records.length >= 100) unlocked.push('records_100')

  // streak_7, streak_30
  const streak = calculateStreak(records)
  if (streak >= 7) unlocked.push('streak_7')
  if (streak >= 30) unlocked.push('streak_30')

  // goal_achieved
  if (goal?.isActive) {
    const sorted = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const latest = sorted[0].weight
    if (latest <= goal.targetWeight) unlocked.push('goal_achieved')
  }

  return unlocked
}

function calculateStreak(records: WeightRecord[]): number {
  if (records.length === 0) return 0

  const dates = records
    .map(r => {
      const d = new Date(r.date)
      return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
    })
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort((a, b) => b - a)

  let streak = 1
  const DAY = 86400000
  for (let i = 1; i < dates.length; i++) {
    if (dates[i - 1] - dates[i] === DAY) streak++
    else break
  }
  return streak
}
