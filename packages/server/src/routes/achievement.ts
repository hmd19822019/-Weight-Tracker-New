import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { AppError } from '../middleware/errorHandler'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// Achievement types
export const ACHIEVEMENT_TYPES = {
  FIRST_RECORD: 'first_record',
  WEEK_STREAK: 'week_streak',
  MONTH_STREAK: 'month_streak',
  GOAL_ACHIEVED: 'goal_achieved',
  WEIGHT_LOSS_5KG: 'weight_loss_5kg',
  WEIGHT_LOSS_10KG: 'weight_loss_10kg',
  WATER_GOAL_7DAYS: 'water_goal_7days',
  FOOD_LOG_30DAYS: 'food_log_30days',
} as const

// GET /api/achievement - Get all achievements for user
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId
    if (!userId) throw new AppError('User not authenticated', 401)

    const achievements = await prisma.achievement.findMany({
      where: { userId },
      orderBy: { unlockedAt: 'desc' },
    })

    res.json({ success: true, achievements })
  } catch (error) {
    next(error)
  }
})

// GET /api/achievement/check - Check and unlock new achievements
router.get('/check', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId
    if (!userId) throw new AppError('User not authenticated', 401)

    const newAchievements = []

    // Check for first record achievement
    const hasFirstRecord = await prisma.achievement.findUnique({
      where: {
        userId_type: {
          userId,
          type: ACHIEVEMENT_TYPES.FIRST_RECORD,
        },
      },
    })

    if (!hasFirstRecord) {
      const weightRecordCount = await prisma.weightRecord.count({
        where: { userId },
      })

      if (weightRecordCount >= 1) {
        const achievement = await prisma.achievement.create({
          data: {
            userId,
            type: ACHIEVEMENT_TYPES.FIRST_RECORD,
            syncStatus: 'synced',
          },
        })
        newAchievements.push(achievement)
      }
    }

    // Check for weight loss achievements
    const weightRecords = await prisma.weightRecord.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
      take: 2,
    })

    if (weightRecords.length >= 2) {
      const firstWeight = weightRecords[0].weight
      const latestWeight = await prisma.weightRecord.findFirst({
        where: { userId },
        orderBy: { date: 'desc' },
      })

      if (latestWeight) {
        const weightLoss = firstWeight - latestWeight.weight

        // 5kg achievement
        if (weightLoss >= 5) {
          const has5kg = await prisma.achievement.findUnique({
            where: {
              userId_type: {
                userId,
                type: ACHIEVEMENT_TYPES.WEIGHT_LOSS_5KG,
              },
            },
          })

          if (!has5kg) {
            const achievement = await prisma.achievement.create({
              data: {
                userId,
                type: ACHIEVEMENT_TYPES.WEIGHT_LOSS_5KG,
                syncStatus: 'synced',
              },
            })
            newAchievements.push(achievement)
          }
        }

        // 10kg achievement
        if (weightLoss >= 10) {
          const has10kg = await prisma.achievement.findUnique({
            where: {
              userId_type: {
                userId,
                type: ACHIEVEMENT_TYPES.WEIGHT_LOSS_10KG,
              },
            },
          })

          if (!has10kg) {
            const achievement = await prisma.achievement.create({
              data: {
                userId,
                type: ACHIEVEMENT_TYPES.WEIGHT_LOSS_10KG,
                syncStatus: 'synced',
              },
            })
            newAchievements.push(achievement)
          }
        }
      }
    }

    // Check for goal achieved
    const activeGoal = await prisma.goal.findFirst({
      where: { userId, isActive: true },
    })

    if (activeGoal) {
      const latestWeight = await prisma.weightRecord.findFirst({
        where: { userId },
        orderBy: { date: 'desc' },
      })

      if (latestWeight && latestWeight.weight <= activeGoal.targetWeight) {
        const hasGoalAchieved = await prisma.achievement.findUnique({
          where: {
            userId_type: {
              userId,
              type: ACHIEVEMENT_TYPES.GOAL_ACHIEVED,
            },
          },
        })

        if (!hasGoalAchieved) {
          const achievement = await prisma.achievement.create({
            data: {
              userId,
              type: ACHIEVEMENT_TYPES.GOAL_ACHIEVED,
              syncStatus: 'synced',
            },
          })
          newAchievements.push(achievement)
        }
      }
    }

    res.json({ success: true, newAchievements })
  } catch (error) {
    next(error)
  }
})

// POST /api/achievement/unlock - Manually unlock achievement (for testing)
router.post('/unlock', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId
    if (!userId) throw new AppError('User not authenticated', 401)

    const { type } = req.body
    if (!type) {
      throw new AppError('Achievement type is required', 400)
    }

    // Check if already unlocked
    const existing = await prisma.achievement.findUnique({
      where: {
        userId_type: {
          userId,
          type,
        },
      },
    })

    if (existing) {
      throw new AppError('Achievement already unlocked', 400)
    }

    const achievement = await prisma.achievement.create({
      data: {
        userId,
        type,
        syncStatus: 'synced',
      },
    })

    res.status(201).json({ success: true, achievement })
  } catch (error) {
    next(error)
  }
})

// POST /api/achievement/sync - Batch sync achievements
router.post('/sync', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId
    if (!userId) throw new AppError('User not authenticated', 401)

    const { achievements } = req.body
    if (!Array.isArray(achievements)) {
      throw new AppError('Achievements must be an array', 400)
    }

    const synced = []
    for (const achievement of achievements) {
      const existing = await prisma.achievement.findUnique({
        where: {
          userId_type: {
            userId,
            type: achievement.type,
          },
        },
      })

      if (!existing) {
        // Create new achievement
        const created = await prisma.achievement.create({
          data: {
            id: achievement.id,
            userId,
            type: achievement.type,
            unlockedAt: achievement.unlockedAt ? new Date(achievement.unlockedAt) : new Date(),
            syncStatus: 'synced',
          },
        })
        synced.push(created)
      }
      // Skip existing achievements - don't add to synced array
    }

    res.json({ success: true, synced })
  } catch (error) {
    next(error)
  }
})

export default router
