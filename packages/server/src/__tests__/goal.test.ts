import request from 'supertest'
import { app } from '../index'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

describe('Goal Routes', () => {
  let token: string
  let userId: string
  let goalId: string

  beforeAll(async () => {
    // 创建测试用户
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        phone: '13800000004',
        password: 'Test123456',
        nickname: 'Goal Test User'
      })

    token = response.body.token
    userId = response.body.user.id
  })

  afterAll(async () => {
    // 清理测试数据
    await prisma.goal.deleteMany({ where: { userId } })
    await prisma.user.delete({ where: { id: userId } })
    await prisma.$disconnect()
  })

  describe('POST /api/goal', () => {
    it('should create a goal', async () => {
      const response = await request(app)
        .post('/api/goal')
        .set('Authorization', `Bearer ${token}`)
        .send({
          startWeight: 75.0,
          targetWeight: 70.0,
          startDate: '2024-03-01',
          endDate: '2024-06-01'
        })

      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.goal).toHaveProperty('id')
      expect(response.body.goal.startWeight).toBe(75.0)
      expect(response.body.goal.targetWeight).toBe(70.0)
      expect(response.body.goal.isActive).toBe(true)

      goalId = response.body.goal.id
    })

    it('should deactivate previous active goal when creating new one', async () => {
      const response = await request(app)
        .post('/api/goal')
        .set('Authorization', `Bearer ${token}`)
        .send({
          startWeight: 70.0,
          targetWeight: 65.0,
          startDate: '2024-06-01',
          endDate: '2024-09-01'
        })

      expect(response.status).toBe(201)
      expect(response.body.goal.isActive).toBe(true)

      // 检查之前的目标是否被停用
      const oldGoal = await prisma.goal.findUnique({ where: { id: goalId } })
      expect(oldGoal?.isActive).toBe(false)

      goalId = response.body.goal.id
    })

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/goal')
        .send({
          startWeight: 75.0,
          targetWeight: 70.0,
          startDate: '2024-03-01',
          endDate: '2024-06-01'
        })

      expect(response.status).toBe(401)
    })

    it('should fail without required fields', async () => {
      const response = await request(app)
        .post('/api/goal')
        .set('Authorization', `Bearer ${token}`)
        .send({
          startWeight: 75.0
        })

      expect(response.status).toBe(400)
    })
  })

  describe('GET /api/goal', () => {
    it('should get all goals', async () => {
      const response = await request(app)
        .get('/api/goal')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(Array.isArray(response.body.goals)).toBe(true)
      expect(response.body.goals.length).toBeGreaterThan(0)
    })

    it('should filter by active status', async () => {
      const response = await request(app)
        .get('/api/goal?isActive=true')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.goals.every((g: any) => g.isActive === true)).toBe(true)
    })

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/goal')

      expect(response.status).toBe(401)
    })
  })

  describe('GET /api/goal/active', () => {
    it('should get active goal', async () => {
      const response = await request(app)
        .get('/api/goal/active')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.goal).toBeDefined()
      expect(response.body.goal.isActive).toBe(true)
    })

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/goal/active')

      expect(response.status).toBe(401)
    })
  })

  describe('GET /api/goal/:id', () => {
    it('should get specific goal', async () => {
      const response = await request(app)
        .get(`/api/goal/${goalId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.goal.id).toBe(goalId)
    })

    it('should fail with non-existent goal', async () => {
      const response = await request(app)
        .get('/api/goal/non-existent-id')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(404)
    })

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get(`/api/goal/${goalId}`)

      expect(response.status).toBe(401)
    })
  })

  describe('PUT /api/goal/:id', () => {
    it('should update a goal', async () => {
      const response = await request(app)
        .put(`/api/goal/${goalId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          targetWeight: 68.0,
          endDate: '2024-10-01'
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.goal.targetWeight).toBe(68.0)
    })

    it('should deactivate other goals when activating one', async () => {
      // 创建另一个目标
      const createResponse = await request(app)
        .post('/api/goal')
        .set('Authorization', `Bearer ${token}`)
        .send({
          startWeight: 68.0,
          targetWeight: 65.0,
          startDate: '2024-10-01',
          endDate: '2025-01-01'
        })

      const newGoalId = createResponse.body.goal.id

      // 激活旧目标
      const updateResponse = await request(app)
        .put(`/api/goal/${goalId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          isActive: true
        })

      expect(updateResponse.status).toBe(200)

      // 检查新目标是否被停用
      const newGoal = await prisma.goal.findUnique({ where: { id: newGoalId } })
      expect(newGoal?.isActive).toBe(false)
    })

    it('should fail with non-existent goal', async () => {
      const response = await request(app)
        .put('/api/goal/non-existent-id')
        .set('Authorization', `Bearer ${token}`)
        .send({
          targetWeight: 68.0
        })

      expect(response.status).toBe(404)
    })

    it('should fail without authentication', async () => {
      const response = await request(app)
        .put(`/api/goal/${goalId}`)
        .send({
          targetWeight: 68.0
        })

      expect(response.status).toBe(401)
    })
  })

  describe('POST /api/goal/sync', () => {
    it('should sync goals', async () => {
      const goals = [
        {
          id: 'sync-goal-1',
          startWeight: 80.0,
          targetWeight: 75.0,
          startDate: new Date('2024-01-01').toISOString(),
          endDate: new Date('2024-04-01').toISOString(),
          isActive: false,
          version: 1
        }
      ]

      const response = await request(app)
        .post('/api/goal/sync')
        .set('Authorization', `Bearer ${token}`)
        .send({ goals })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(Array.isArray(response.body.synced)).toBe(true)
    })

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/goal/sync')
        .send({ goals: [] })

      expect(response.status).toBe(401)
    })
  })

  describe('DELETE /api/goal/:id', () => {
    it('should delete a goal', async () => {
      // 创建一个用于删除的目标
      const createResponse = await request(app)
        .post('/api/goal')
        .set('Authorization', `Bearer ${token}`)
        .send({
          startWeight: 75.0,
          targetWeight: 70.0,
          startDate: '2025-01-01',
          endDate: '2025-04-01'
        })

      const deleteId = createResponse.body.goal.id

      const response = await request(app)
        .delete(`/api/goal/${deleteId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)

      // 验证已删除
      const deleted = await prisma.goal.findUnique({ where: { id: deleteId } })
      expect(deleted).toBeNull()
    })

    it('should fail with non-existent goal', async () => {
      const response = await request(app)
        .delete('/api/goal/non-existent-id')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(404)
    })

    it('should fail without authentication', async () => {
      const response = await request(app)
        .delete(`/api/goal/${goalId}`)

      expect(response.status).toBe(401)
    })
  })
})
