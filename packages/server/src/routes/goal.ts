import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { AppError } from '../middleware/errorHandler'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// GET /api/goal - Get all goals for user
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId
    if (!userId) throw new AppError('User not authenticated', 401)

    const { isActive } = req.query
    const where: any = { userId }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    const goals = await prisma.goal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    res.json({ success: true, goals })
  } catch (error) {
    next(error)
  }
})

// GET /api/goal/active - Get active goal for user
router.get('/active', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId
    if (!userId) throw new AppError('User not authenticated', 401)

    const goal = await prisma.goal.findFirst({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    })

    res.json({ success: true, goal })
  } catch (error) {
    next(error)
  }
})

// GET /api/goal/:id - Get specific goal
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId
    if (!userId) throw new AppError('User not authenticated', 401)

    const { id } = req.params

    const goal = await prisma.goal.findUnique({ where: { id } })
    if (!goal) throw new AppError('Goal not found', 404)
    if (goal.userId !== userId) throw new AppError('Unauthorized', 403)

    res.json({ success: true, goal })
  } catch (error) {
    next(error)
  }
})

// POST /api/goal - Create new goal
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId
    if (!userId) throw new AppError('User not authenticated', 401)

    const { startWeight, targetWeight, startDate, endDate } = req.body
    if (!startWeight || !targetWeight || !startDate || !endDate) {
      throw new AppError('All goal fields are required', 400)
    }

    // Deactivate existing active goals
    await prisma.goal.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    })

    const goal = await prisma.goal.create({
      data: {
        userId,
        startWeight: parseFloat(startWeight),
        targetWeight: parseFloat(targetWeight),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: true,
        syncStatus: 'synced',
        version: 1,
      },
    })

    res.status(201).json({ success: true, goal })
  } catch (error) {
    next(error)
  }
})

// PUT /api/goal/:id - Update goal
router.put('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId
    if (!userId) throw new AppError('User not authenticated', 401)

    const { id } = req.params
    const { startWeight, targetWeight, startDate, endDate, isActive } = req.body

    // Verify ownership
    const existing = await prisma.goal.findUnique({ where: { id } })
    if (!existing) throw new AppError('Goal not found', 404)
    if (existing.userId !== userId) throw new AppError('Unauthorized', 403)

    // If activating this goal, deactivate others
    if (isActive === true) {
      await prisma.goal.updateMany({
        where: { userId, isActive: true, id: { not: id } },
        data: { isActive: false },
      })
    }

    const goal = await prisma.goal.update({
      where: { id },
      data: {
        startWeight: startWeight !== undefined ? parseFloat(startWeight) : undefined,
        targetWeight: targetWeight !== undefined ? parseFloat(targetWeight) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
        version: { increment: 1 },
      },
    })

    res.json({ success: true, goal })
  } catch (error) {
    next(error)
  }
})

// DELETE /api/goal/:id - Delete goal
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId
    if (!userId) throw new AppError('User not authenticated', 401)

    const { id } = req.params

    // Verify ownership
    const existing = await prisma.goal.findUnique({ where: { id } })
    if (!existing) throw new AppError('Goal not found', 404)
    if (existing.userId !== userId) throw new AppError('Unauthorized', 403)

    await prisma.goal.delete({ where: { id } })

    res.json({ success: true, message: 'Goal deleted' })
  } catch (error) {
    next(error)
  }
})

// POST /api/goal/sync - Batch sync goals
router.post('/sync', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId
    if (!userId) throw new AppError('User not authenticated', 401)

    const { goals } = req.body
    if (!Array.isArray(goals)) {
      throw new AppError('Goals must be an array', 400)
    }

    const synced = []
    for (const goal of goals) {
      const existing = await prisma.goal.findFirst({
        where: { id: goal.id, userId },
      })

      if (existing) {
        // Conflict resolution: higher version wins
        if (goal.version > existing.version) {
          const updated = await prisma.goal.update({
            where: { id: goal.id },
            data: {
              startWeight: goal.startWeight,
              targetWeight: goal.targetWeight,
              startDate: new Date(goal.startDate),
              endDate: new Date(goal.endDate),
              isActive: goal.isActive,
              syncStatus: 'synced',
              version: goal.version,
            },
          })
          synced.push(updated)
        } else {
          synced.push(existing)
        }
      } else {
        // Create new goal
        const created = await prisma.goal.create({
          data: {
            id: goal.id,
            userId,
            startWeight: goal.startWeight,
            targetWeight: goal.targetWeight,
            startDate: new Date(goal.startDate),
            endDate: new Date(goal.endDate),
            isActive: goal.isActive,
            syncStatus: 'synced',
            version: goal.version || 1,
          },
        })
        synced.push(created)
      }
    }

    res.json({ success: true, synced })
  } catch (error) {
    next(error)
  }
})

export default router
