import request from 'supertest'
import { app } from '../index'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

describe('Food Routes', () => {
  let token: string
  let userId: string
  let recordId: string

  beforeAll(async () => {
    // 创建测试用户（使用验证码登录）
    const response = await request(app)
      .post('/api/auth/verify-code')
      .send({
        phone: '13800000006',
        code: '123456'
      })

    token = response.body.token
    userId = response.body.user.id
  })

  afterAll(async () => {
    if (userId) {
      // Delete all related data first to avoid foreign key constraints
      await prisma.achievement.deleteMany({ where: { userId } })
      await prisma.goal.deleteMany({ where: { userId } })
      await prisma.foodRecord.deleteMany({ where: { userId } })
      await prisma.waterIntake.deleteMany({ where: { userId } })
      await prisma.weightRecord.deleteMany({ where: { userId } })
      await prisma.settings.deleteMany({ where: { userId } })
      await prisma.user.deleteMany({ where: { id: userId } })
    }
    await prisma.$disconnect()
  })

  describe('POST /api/food', () => {
    it('should create a food record', async () => {
      const response = await request(app)
        .post('/api/food')
        .set('Authorization', `Bearer ${token}`)
        .send({
          date: new Date().toISOString(),
          name: 'Apple',
          calories: 95,
          mealType: 'snack'
        })

      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.record).toHaveProperty('id')
      expect(response.body.record.name).toBe('Apple')
      expect(response.body.record.calories).toBe(95)

      recordId = response.body.record.id
    })

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/food')
        .send({
          date: new Date().toISOString(),
          name: 'Banana',
          calories: 105
        })

      expect(response.status).toBe(401)
    })

    it('should fail without required fields', async () => {
      const response = await request(app)
        .post('/api/food')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Orange'
        })

      expect(response.status).toBe(400)
    })
  })

  describe('GET /api/food', () => {
    it('should get all food records', async () => {
      const response = await request(app)
        .get('/api/food')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(Array.isArray(response.body.records)).toBe(true)
      expect(response.body.records.length).toBeGreaterThan(0)
    })

    it('should filter by date range', async () => {
      const startDate = new Date('2024-01-01').toISOString()
      const endDate = new Date('2024-12-31').toISOString()

      const response = await request(app)
        .get(`/api/food?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body.records)).toBe(true)
    })

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/food')

      expect(response.status).toBe(401)
    })
  })

  describe('GET /api/food/:id', () => {
    it('should get specific food record', async () => {
      const response = await request(app)
        .get(`/api/food/${recordId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.record.id).toBe(recordId)
    })

    it('should fail with non-existent record', async () => {
      const response = await request(app)
        .get('/api/food/non-existent-id')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(404)
    })

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get(`/api/food/${recordId}`)

      expect(response.status).toBe(401)
    })
  })

  describe('PUT /api/food/:id', () => {
    it('should update a food record', async () => {
      const response = await request(app)
        .put(`/api/food/${recordId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          calories: 100,
          notes: 'Updated calories'
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.record.calories).toBe(100)
      expect(response.body.record.notes).toBe('Updated calories')
    })

    it('should fail with non-existent record', async () => {
      const response = await request(app)
        .put('/api/food/non-existent-id')
        .set('Authorization', `Bearer ${token}`)
        .send({
          calories: 100
        })

      expect(response.status).toBe(404)
    })

    it('should fail without authentication', async () => {
      const response = await request(app)
        .put(`/api/food/${recordId}`)
        .send({
          calories: 100
        })

      expect(response.status).toBe(401)
    })
  })

  describe('POST /api/food/recognize', () => {
    it.skip('should recognize food from image URL', async () => {
      // Skip: requires real Baidu AI credentials
      const response = await request(app)
        .post('/api/food/recognize')
        .set('Authorization', `Bearer ${token}`)
        .send({
          imageUrl: 'https://example.com/food.jpg'
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.result).toHaveProperty('name')
      expect(response.body.result).toHaveProperty('calories')
    })

    it('should fail without imageUrl', async () => {
      const response = await request(app)
        .post('/api/food/recognize')
        .set('Authorization', `Bearer ${token}`)
        .send({})

      expect(response.status).toBe(400)
    })

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/food/recognize')
        .send({
          imageUrl: 'https://example.com/food.jpg'
        })

      expect(response.status).toBe(401)
    })
  })

  describe('POST /api/food/sync', () => {
    it('should sync food records', async () => {
      const records = [
        {
          id: 'sync-food-1',
          date: new Date('2024-03-01').toISOString(),
          name: 'Chicken Breast',
          calories: 165,
          mealType: 'lunch',
          version: 1
        }
      ]

      const response = await request(app)
        .post('/api/food/sync')
        .set('Authorization', `Bearer ${token}`)
        .send({ records })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(Array.isArray(response.body.synced)).toBe(true)
    })

    it('should handle conflict resolution', async () => {
      const records = [
        {
          id: 'sync-food-1',
          date: new Date('2024-03-01').toISOString(),
          name: 'Chicken Breast Updated',
          calories: 170,
          mealType: 'lunch',
          version: 2
        }
      ]

      const response = await request(app)
        .post('/api/food/sync')
        .set('Authorization', `Bearer ${token}`)
        .send({ records })

      expect(response.status).toBe(200)
      expect(response.body.synced.length).toBeGreaterThan(0)
    })

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/food/sync')
        .send({ records: [] })

      expect(response.status).toBe(401)
    })
  })

  describe('DELETE /api/food/:id', () => {
    it('should delete a food record', async () => {
      // 创建一个用于删除的记录
      const createResponse = await request(app)
        .post('/api/food')
        .set('Authorization', `Bearer ${token}`)
        .send({
          date: new Date().toISOString(),
          name: 'To Delete',
          calories: 50
        })

      const deleteId = createResponse.body.record.id

      const response = await request(app)
        .delete(`/api/food/${deleteId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)

      // 验证已删除
      const deleted = await prisma.foodRecord.findUnique({ where: { id: deleteId } })
      expect(deleted).toBeNull()
    })

    it('should fail with non-existent record', async () => {
      const response = await request(app)
        .delete('/api/food/non-existent-id')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(404)
    })

    it('should fail without authentication', async () => {
      const response = await request(app)
        .delete(`/api/food/${recordId}`)

      expect(response.status).toBe(401)
    })
  })
})
