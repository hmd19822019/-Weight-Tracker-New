import request from 'supertest'
import { app } from '../index'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

describe('Weight Routes', () => {
  let token: string
  let userId: string
  let recordId: string

  beforeAll(async () => {
    // 创建测试用户（使用验证码登录）
    const response = await request(app)
      .post('/api/auth/verify-code')
      .send({
        phone: '13800000002',
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

  describe('POST /api/weight', () => {
    it('should create a weight record', async () => {
      const response = await request(app)
        .post('/api/weight')
        .set('Authorization', `Bearer ${token}`)
        .send({
          date: new Date().toISOString(),
          weight: 70.5,
          bodyFat: 18.5,
          notes: 'Morning weight'
        })

      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.record).toHaveProperty('id')
      expect(response.body.record.weight).toBe(70.5)
      expect(response.body.record.bodyFat).toBe(18.5)
      expect(response.body.record.notes).toBe('Morning weight')

      recordId = response.body.record.id
    })

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/weight')
        .send({
          date: new Date().toISOString(),
          weight: 70.5
        })

      expect(response.status).toBe(401)
    })

    it('should fail without required fields', async () => {
      const response = await request(app)
        .post('/api/weight')
        .set('Authorization', `Bearer ${token}`)
        .send({
          weight: 70.5
        })

      expect(response.status).toBe(400)
    })
  })

  describe('GET /api/weight', () => {
    it('should get all weight records', async () => {
      const response = await request(app)
        .get('/api/weight')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(Array.isArray(response.body.records)).toBe(true)
      expect(response.body.records.length).toBeGreaterThan(0)
    })

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/weight?limit=1&offset=0')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.records.length).toBeLessThanOrEqual(1)
    })

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/weight')

      expect(response.status).toBe(401)
    })
  })

  describe('PUT /api/weight/:id', () => {
    it('should update a weight record', async () => {
      const response = await request(app)
        .put(`/api/weight/${recordId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          weight: 71.0,
          bodyFat: 19.0,
          notes: 'Updated weight'
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.record.weight).toBe(71.0)
      expect(response.body.record.bodyFat).toBe(19.0)
      expect(response.body.record.notes).toBe('Updated weight')
    })

    it('should fail with non-existent record', async () => {
      const response = await request(app)
        .put('/api/weight/non-existent-id')
        .set('Authorization', `Bearer ${token}`)
        .send({
          weight: 71.0
        })

      expect(response.status).toBe(404)
    })

    it('should fail without authentication', async () => {
      const response = await request(app)
        .put(`/api/weight/${recordId}`)
        .send({
          weight: 71.0
        })

      expect(response.status).toBe(401)
    })
  })

  describe('POST /api/weight/sync', () => {
    it('should sync weight records', async () => {
      const records = [
        {
          id: 'sync-test-1',
          date: new Date().toISOString(),
          weight: 72.0,
          version: 1
        },
        {
          id: 'sync-test-2',
          date: new Date().toISOString(),
          weight: 72.5,
          version: 1
        }
      ]

      const response = await request(app)
        .post('/api/weight/sync')
        .set('Authorization', `Bearer ${token}`)
        .send({ records })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(Array.isArray(response.body.synced)).toBe(true)
      expect(response.body.synced.length).toBe(2)
    })

    it('should handle conflict resolution', async () => {
      // 先创建一个记录
      const createResponse = await request(app)
        .post('/api/weight')
        .set('Authorization', `Bearer ${token}`)
        .send({
          date: new Date().toISOString(),
          weight: 73.0
        })

      const existingId = createResponse.body.record.id

      // 尝试同步相同 ID 但版本号更高的记录
      const syncResponse = await request(app)
        .post('/api/weight/sync')
        .set('Authorization', `Bearer ${token}`)
        .send({
          records: [{
            id: existingId,
            date: new Date().toISOString(),
            weight: 74.0,
            version: 2
          }]
        })

      expect(syncResponse.status).toBe(200)
      expect(syncResponse.body.synced[0].weight).toBe(74.0)
    })

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/weight/sync')
        .send({ records: [] })

      expect(response.status).toBe(401)
    })
  })

  describe('DELETE /api/weight/:id', () => {
    it('should delete a weight record', async () => {
      const response = await request(app)
        .delete(`/api/weight/${recordId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })

    it('should fail with non-existent record', async () => {
      const response = await request(app)
        .delete('/api/weight/non-existent-id')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(404)
    })

    it('should fail without authentication', async () => {
      const response = await request(app)
        .delete(`/api/weight/${recordId}`)

      expect(response.status).toBe(401)
    })
  })
})
