import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { AppError } from '../middleware/errorHandler'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// GET /api/water - Get water intake records for user
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId
    if (!userId) throw new AppError('User not authenticated', 401)

    const { startDate, endDate } = req.query
    const where: any = { userId }

    if (startDate && endDate) {
      where.date = {
        gte: startDate as string,
        lte: endDate as string,
      }
    }

    const records = await prisma.waterIntake.findMany({
      where,
      orderBy: { date: 'desc' },
    })

    res.json({ success: true, records })
  } catch (error) {
    next(error)
  }
})

// GET /api/water/:date - Get water intake for specific date
router.get('/:date', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId
    if (!userId) throw new AppError('User not authenticated', 401)

    const { date } = req.params

    const record = await prisma.waterIntake.findUnique({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
    })

    res.json({ success: true, record })
  } catch (error) {
    next(error)
  }
})

// POST /api/water - Create or update water intake record
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId
    if (!userId) throw new AppError('User not authenticated', 401)

    const { date, amount, target } = req.body
    if (!date || amount === undefined) {
      throw new AppError('Date and amount are required', 400)
    }

    const record = await prisma.waterIntake.upsert({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
      update: {
        amount: parseInt(amount),
        target: target ? parseInt(target) : undefined,
        syncStatus: 'synced',
        version: { increment: 1 },
      },
      create: {
        userId,
        date,
        amount: parseInt(amount),
        target: target ? parseInt(target) : 2000,
        syncStatus: 'synced',
        version: 1,
      },
    })

    res.status(201).json({ success: true, record })
  } catch (error) {
    next(error)
  }
})

// PUT /api/water/:date - Update water intake record
router.put('/:date', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId
    if (!userId) throw new AppError('User not authenticated', 401)

    const { date } = req.params
    const { amount, target } = req.body

    // Verify record exists
    const existing = await prisma.waterIntake.findUnique({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
    })

    if (!existing) throw new AppError('Record not found', 404)

    const record = await prisma.waterIntake.update({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
      data: {
        amount: amount !== undefined ? parseInt(amount) : undefined,
        target: target !== undefined ? parseInt(target) : undefined,
        version: { increment: 1 },
      },
    })

    res.json({ success: true, record })
  } catch (error) {
    next(error)
  }
})

// DELETE /api/water/:date - Delete water intake record
router.delete('/:date', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId
    if (!userId) throw new AppError('User not authenticated', 401)

    const { date } = req.params

    // Verify record exists
    const existing = await prisma.waterIntake.findUnique({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
    })

    if (!existing) throw new AppError('Record not found', 404)

    await prisma.waterIntake.delete({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
    })

    res.json({ success: true, message: 'Record deleted' })
  } catch (error) {
    next(error)
  }
})

// POST /api/water/sync - Batch sync water intake records
router.post('/sync', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId
    if (!userId) throw new AppError('User not authenticated', 401)

    const { records } = req.body
    if (!Array.isArray(records)) {
      throw new AppError('Records must be an array', 400)
    }

    const synced = []
    for (const record of records) {
      const existing = await prisma.waterIntake.findUnique({
        where: {
          userId_date: {
            userId,
            date: record.date,
          },
        },
      })

      if (existing) {
        // Conflict resolution: higher version wins
        if (record.version > existing.version) {
          const updated = await prisma.waterIntake.update({
            where: {
              userId_date: {
                userId,
                date: record.date,
              },
            },
            data: {
              amount: record.amount,
              target: record.target,
              syncStatus: 'synced',
              version: record.version,
            },
          })
          synced.push(updated)
        } else {
          synced.push(existing)
        }
      } else {
        // Create new record
        const created = await prisma.waterIntake.create({
          data: {
            userId,
            date: record.date,
            amount: record.amount,
            target: record.target || 2000,
            syncStatus: 'synced',
            version: record.version || 1,
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
