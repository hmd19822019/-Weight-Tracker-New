import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { AppError } from '../middleware/errorHandler'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// GET /api/weight - Get all weight records for user
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId
    if (!userId) throw new AppError('User not authenticated', 401)

    const { limit, offset } = req.query
    const records = await prisma.weightRecord.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: limit ? parseInt(limit as string) : undefined,
      skip: offset ? parseInt(offset as string) : undefined,
    })

    res.json({ success: true, records })
  } catch (error) {
    next(error)
  }
})

// POST /api/weight - Create weight record
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId
    if (!userId) throw new AppError('User not authenticated', 401)

    const { date, weight, bodyFat, notes, photoUrl } = req.body
    if (!date || !weight) {
      throw new AppError('Date and weight are required', 400)
    }

    const record = await prisma.weightRecord.create({
      data: {
        userId,
        date: new Date(date),
        weight: parseFloat(weight),
        bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
        notes,
        photoUrl,
        syncStatus: 'synced',
        version: 1,
      },
    })

    res.status(201).json({ success: true, record })
  } catch (error) {
    next(error)
  }
})

// PUT /api/weight/:id - Update weight record
router.put('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId
    if (!userId) throw new AppError('User not authenticated', 401)

    const { id } = req.params
    const { weight, bodyFat, notes, photoUrl } = req.body

    // Verify ownership
    const existing = await prisma.weightRecord.findUnique({ where: { id } })
    if (!existing) throw new AppError('Record not found', 404)
    if (existing.userId !== userId) throw new AppError('Unauthorized', 403)

    const record = await prisma.weightRecord.update({
      where: { id },
      data: {
        weight: weight ? parseFloat(weight) : undefined,
        bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
        notes,
        photoUrl,
        version: { increment: 1 },
      },
    })

    res.json({ success: true, record })
  } catch (error) {
    next(error)
  }
})

// DELETE /api/weight/:id - Delete weight record
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId
    if (!userId) throw new AppError('User not authenticated', 401)

    const { id } = req.params

    // Verify ownership
    const existing = await prisma.weightRecord.findUnique({ where: { id } })
    if (!existing) throw new AppError('Record not found', 404)
    if (existing.userId !== userId) throw new AppError('Unauthorized', 403)

    await prisma.weightRecord.delete({ where: { id } })

    res.json({ success: true, message: 'Record deleted' })
  } catch (error) {
    next(error)
  }
})

// POST /api/weight/sync - Batch sync weight records
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
      const existing = await prisma.weightRecord.findFirst({
        where: { id: record.id, userId },
      })

      if (existing) {
        // Conflict resolution: server version wins if versions differ
        if (record.version > existing.version) {
          const updated = await prisma.weightRecord.update({
            where: { id: record.id },
            data: {
              weight: record.weight,
              bodyFat: record.bodyFat,
              notes: record.notes,
              photoUrl: record.photoUrl,
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
        const created = await prisma.weightRecord.create({
          data: {
            id: record.id,
            userId,
            date: new Date(record.date),
            weight: record.weight,
            bodyFat: record.bodyFat,
            notes: record.notes,
            photoUrl: record.photoUrl,
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
