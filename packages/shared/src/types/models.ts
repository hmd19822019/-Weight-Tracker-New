// 同步状态
export type SyncStatus = 'local' | 'synced' | 'pending'

// 体重记录
export interface WeightRecord {
  id: string
  userId?: string
  date: Date
  weight: number
  bodyFat?: number
  notes?: string
  photoUrl?: string
  localPhotoUri?: string
  syncStatus: SyncStatus
  version: number
  createdAt: Date
  updatedAt: Date
}

// 饮水记录
export interface WaterIntake {
  id: string
  userId?: string
  date: string  // YYYY-MM-DD
  amount: number  // ml
  target: number  // ml
  syncStatus: SyncStatus
  version: number
}

// 食物记录
export interface FoodRecord {
  id: string
  userId?: string
  date: Date
  name: string
  calories: number
  photoUrl?: string
  confidence?: number  // 0-1
  syncStatus: SyncStatus
  version: number
  createdAt: Date
  updatedAt: Date
}

// 用户目标
export interface UserGoal {
  id: string
  userId?: string
  startWeight: number
  targetWeight: number
  startDate: Date
  endDate: Date
  isActive: boolean
  syncStatus: SyncStatus
  version: number
}

// 成就类型
export type AchievementType =
  | 'first_record'
  | 'streak_7'
  | 'streak_30'
  | 'records_10'
  | 'records_50'
  | 'records_100'
  | 'goal_achieved'

// 成就
export interface Achievement {
  id: string
  userId?: string
  type: AchievementType
  unlockedAt: Date
  syncStatus: SyncStatus
}

// 用户信息
export interface User {
  id: string
  phone?: string
  wechatOpenId?: string
  nickname?: string
  avatar?: string
  height?: number  // cm
  gender?: 'male' | 'female'
  createdAt: Date
}

// 用户设置
export interface Settings {
  darkMode: boolean
  language: 'zh' | 'en'
  waterTarget: number  // ml
  calorieTarget: number  // kcal
  autoSync: boolean
}
