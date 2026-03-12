import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { AppError } from '../middleware/errorHandler'
import { authenticate, AuthRequest } from '../middleware/auth'
import { baiduAIService } from '../services/baiduAI'

const router = Router()
const prisma = new PrismaClient()

// GET /api/food - Get all food records for user
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId
    if (!userId) throw new AppError('User not authenticated', 401)

    const { startDate, endDate, limit, offset } = req.query
    const where: any = { userId }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      }
    }

    const records = await prisma.foodRecord.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit ? parseInt(limit as string) : undefined,
      skip: offset ? parseInt(offset as string) : undefined,
    })

    res.json({ success: true, records })
  } catch (error) {
    next(error)
  }
})

// POST /api/food - Create food record
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId
    if (!userId) throw new AppError('User not authenticated', 401)

    const { date, name, calories, photoUrl, confidence } = req.body
    if (!date || !name || calories === undefined) {
      throw new AppError('Date, name, and calories are required', 400)
    }

    const record = await prisma.foodRecord.create({
      data: {
        userId,
        date: new Date(date),
        name,
        calories: parseInt(calories),
        photoUrl,
        confidence: confidence ? parseFloat(confidence) : undefined,
        syncStatus: 'synced',
        version: 1,
      },
    })

    res.status(201).json({ success: true, record })
  } catch (error) {
    next(error)
  }
})

// GET /api/food/:id - Get specific food record
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId
    if (!userId) throw new AppError('User not authenticated', 401)

    const { id } = req.params

    const record = await prisma.foodRecord.findUnique({ where: { id } })
    if (!record) throw new AppError('Record not found', 404)
    if (record.userId !== userId) throw new AppError('Unauthorized', 403)

    res.json({ success: true, record })
  } catch (error) {
    next(error)
  }
})

// PUT /api/food/:id - Update food record
router.put('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId
    if (!userId) throw new AppError('User not authenticated', 401)

    const { id } = req.params
    const { name, calories, photoUrl, notes } = req.body

    // Verify ownership
    const existing = await prisma.foodRecord.findUnique({ where: { id } })
    if (!existing) throw new AppError('Record not found', 404)
    if (existing.userId !== userId) throw new AppError('Unauthorized', 403)

    const record = await prisma.foodRecord.update({
      where: { id },
      data: {
        name: name || undefined,
        calories: calories !== undefined ? parseInt(calories) : undefined,
        photoUrl: photoUrl !== undefined ? photoUrl : undefined,
        notes: notes !== undefined ? notes : undefined,
        version: { increment: 1 },
      },
    })

    res.json({ success: true, record })
  } catch (error) {
    next(error)
  }
})

// DELETE /api/food/:id - Delete food record
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId
    if (!userId) throw new AppError('User not authenticated', 401)

    const { id } = req.params

    // Verify ownership
    const existing = await prisma.foodRecord.findUnique({ where: { id } })
    if (!existing) throw new AppError('Record not found', 404)
    if (existing.userId !== userId) throw new AppError('Unauthorized', 403)

    await prisma.foodRecord.delete({ where: { id } })

    res.json({ success: true, message: 'Record deleted' })
  } catch (error) {
    next(error)
  }
})

// POST /api/food/recognize - Recognize food from image (Baidu AI integration)
router.post('/recognize', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId
    if (!userId) throw new AppError('User not authenticated', 401)

    const { imageUrl } = req.body
    if (!imageUrl) {
      throw new AppError('Image URL is required', 400)
    }

    // 调用百度 AI 服务识别食物
    const result = await baiduAIService.recognizeFood(imageUrl)

    res.json({ success: true, result })
  } catch (error) {
    next(error)
  }
})

// POST /api/food/sync - Batch sync food records
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
      const existing = await prisma.foodRecord.findFirst({
        where: { id: record.id, userId },
      })

      if (existing) {
        // Conflict resolution: higher version wins
        if (record.version > existing.version) {
          const updated = await prisma.foodRecord.update({
            where: { id: record.id },
            data: {
              name: record.name,
              calories: record.calories,
              photoUrl: record.photoUrl,
              confidence: record.confidence,
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
        const created = await prisma.foodRecord.create({
          data: {
            id: record.id,
            userId,
            date: new Date(record.date),
            name: record.name,
            calories: record.calories,
            photoUrl: record.photoUrl,
            confidence: record.confidence,
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
