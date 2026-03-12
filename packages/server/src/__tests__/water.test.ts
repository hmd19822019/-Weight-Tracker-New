import request from 'supertest'
import { app } from '../index'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

describe('Water Routes', () => {
  let token: string
  let userId: string
  const testDate = '2024-03-12'

  beforeAll(async () => {
    // 创建测试用户
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        phone: '13800000003',
        password: 'Test123456',
        nickname: 'Water Test User'
      })

    token = response.body.token
    userId = response.body.user.id
  })

  afterAll(async () => {
    // 清理测试数据
    await prisma.waterIntake.deleteMany({ where: { userId } })
    await prisma.user.delete({ where: { id: userId } })
    await prisma.$disconnect()
  })

  describe('POST /api/water', () => {
    it('should create a water intake record', async () => {
      const response = await request(app)
        .post('/api/water')
        .set('Authorization', `Bearer ${token}`)
        .send({
          date: testDate,
          amount: 1500,
          target: 2000
        })

      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.record.date).toBe(testDate)
      expect(response.body.record.amount).toBe(1500)
      expect(response.body.record.target).toBe(2000)
    })

    it('should update existing record with upsert', async () => {
      const response = await request(app)
        .post('/api/water')
        .set('Authorization', `Bearer ${token}`)
        .send({
          date: testDate,
          amount: 1800,
          target: 2000
        })

      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.record.amount).toBe(1800)
    })

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/water')
        .send({
          date: testDate,
          amount: 1500
        })

      expect(response.status).toBe(401)
    })

    it('should fail without required fields', async () => {
      const response = await request(app)
        .post('/api/water')
        .set('Authorization', `Bearer ${token}`)
        .send({
          date: testDate
        })

      expect(response.status).toBe(400)
    })
  })

  describe('GET /api/water', () => {
    it('should get all water intake records', async () => {
      const response = await request(app)
        .get('/api/water')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(Array.isArray(response.body.records)).toBe(true)
      expect(response.body.records.length).toBeGreaterThan(0)
    })

    it('should filter by date range', async () => {
      const response = await request(app)
        .get('/api/water?startDate=2024-03-01&endDate=2024-03-31')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/water')

      expect(response.status).toBe(401)
    })
  })

  describe('GET /api/water/:date', () => {
    it('should get water intake for specific date', async () => {
      const response = await request(app)
        .get(`/api/water/${testDate}`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.record).toBeDefined()
      expect(response.body.record.date).toBe(testDate)
    })

    it('should return null for non-existent date', async () => {
      const response = await request(app)
        .get('/api/water/2024-01-01')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.record).toBeNull()
    })

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get(`/api/water/${testDate}`)

      expect(response.status).toBe(401)
    })
  })

  describe('PUT /api/water/:date', () => {
    it('should update water intake record', async () => {
      const response = await request(app)
        .put(`/api/water/${testDate}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 2000,
          target: 2500
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.record.amount).toBe(2000)
      expect(response.body.record.target).toBe(2500)
    })

    it('should fail with non-existent date', async () => {
      const response = await request(app)
        .put('/api/water/2024-01-01')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 2000
        })

      expect(response.status).toBe(404)
    })

    it('should fail without authentication', async () => {
      const response = await request(app)
        .put(`/api/water/${testDate}`)
        .send({
          amount: 2000
        })

      expect(response.status).toBe(401)
    })
  })

  describe('POST /api/water/sync', () => {
    it('should sync water intake records', async () => {
      const records = [
        {
          date: '2024-03-13',
          amount: 1600,
          target: 2000,
          version: 1
        },
        {
          date: '2024-03-14',
          amount: 1700,
          target: 2000,
          version: 1
        }
      ]

      const response = await request(app)
        .post('/api/water/sync')
        .set('Authorization', `Bearer ${token}`)
        .send({ records })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(Array.isArray(response.body.synced)).toBe(true)
      expect(response.body.synced.length).toBe(2)
    })

    it('should handle conflict resolution', async () => {
      // 先创建一个记录
      await request(app)
        .post('/api/water')
        .set('Authorization', `Bearer ${token}`)
        .send({
          date: '2024-03-15',
          amount: 1500,
          target: 2000
        })

      // 尝试同步相同日期但版本号更高的记录
      const syncResponse = await request(app)
        .post('/api/water/sync')
        .set('Authorization', `Bearer ${token}`)
        .send({
          records: [{
            date: '2024-03-15',
            amount: 1800,
            target: 2000,
            version: 2
          }]
        })

      expect(syncResponse.status).toBe(200)
      expect(syncResponse.body.synced[0].amount).toBe(1800)
    })

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/water/sync')
        .send({ records: [] })

      expect(response.status).toBe(401)
    })
  })

  describe('DELETE /api/water/:date', () => {
    it('should delete water intake record', async () => {
      // 先创建一个记录
      const createDate = '2024-03-16'
      await request(app)
        .post('/api/water')
        .set('Authorization', `Bearer ${token}`)
        .send({
          date: createDate,
          amount: 1500,
          target: 2000
        })

      // 删除记录
      const response = await request(app)
        .delete(`/api/water/${createDate}`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)

      // 验证已删除
      const getResponse = await request(app)
        .get(`/api/water/${createDate}`)
        .set('Authorization', `Bearer ${token}`)

      expect(getResponse.body.record).toBeNull()
    })

    it('should fail with non-existent date', async () => {
      const response = await request(app)
        .delete('/api/water/2024-01-01')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(404)
    })

    it('should fail without authentication', async () => {
      const response = await request(app)
        .delete(`/api/water/${testDate}`)

      expect(response.status).toBe(401)
    })
  })
})
