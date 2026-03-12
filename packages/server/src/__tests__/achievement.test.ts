import request from 'supertest'
import { app } from '../index'
import { PrismaClient } from '@prisma/client'
import { ACHIEVEMENT_TYPES } from '../routes/achievement'

const prisma = new PrismaClient()

describe('Achievement Routes', () => {
  let token: string
  let userId: string

  beforeAll(async () => {
    // 创建测试用户（使用验证码登录）
    const response = await request(app)
      .post('/api/auth/verify-code')
      .send({
        phone: '13800000005',
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

  describe('GET /api/achievement', () => {
    it('should get all achievements', async () => {
      const response = await request(app)
        .get('/api/achievement')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(Array.isArray(response.body.achievements)).toBe(true)
    })

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/achievement')

      expect(response.status).toBe(401)
    })
  })

  describe('POST /api/achievement/unlock', () => {
    it('should unlock an achievement', async () => {
      const response = await request(app)
        .post('/api/achievement/unlock')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: ACHIEVEMENT_TYPES.FIRST_RECORD
        })

      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.achievement.type).toBe(ACHIEVEMENT_TYPES.FIRST_RECORD)
    })

    it('should fail when unlocking duplicate achievement', async () => {
      const response = await request(app)
        .post('/api/achievement/unlock')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: ACHIEVEMENT_TYPES.FIRST_RECORD
        })

      expect(response.status).toBe(400)
    })

    it('should fail without type', async () => {
      const response = await request(app)
        .post('/api/achievement/unlock')
        .set('Authorization', `Bearer ${token}`)
        .send({})

      expect(response.status).toBe(400)
    })

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/achievement/unlock')
        .send({
          type: ACHIEVEMENT_TYPES.WEEK_STREAK
        })

      expect(response.status).toBe(401)
    })
  })

  describe('GET /api/achievement/check', () => {
    beforeAll(async () => {
      // 清理之前的成就
      await prisma.achievement.deleteMany({ where: { userId } })
    })

    it('should check and unlock first record achievement', async () => {
      // 创建第一条体重记录
      await request(app)
        .post('/api/weight')
        .set('Authorization', `Bearer ${token}`)
        .send({
          date: new Date().toISOString(),
          weight: 70.0
        })

      const response = await request(app)
        .get('/api/achievement/check')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(Array.isArray(response.body.newAchievements)).toBe(true)

      // 应该解锁第一条记录成就
      const firstRecordAchievement = response.body.newAchievements.find(
        (a: any) => a.type === ACHIEVEMENT_TYPES.FIRST_RECORD
      )
      expect(firstRecordAchievement).toBeDefined()
    })

    it('should check weight loss achievements', async () => {
      // 创建初始体重记录
      await request(app)
        .post('/api/weight')
        .set('Authorization', `Bearer ${token}`)
        .send({
          date: '2024-01-01',
          weight: 80.0
        })

      // 创建减重 5kg 后的记录
      await request(app)
        .post('/api/weight')
        .set('Authorization', `Bearer ${token}`)
        .send({
          date: new Date().toISOString(),
          weight: 74.5
        })

      const response = await request(app)
        .get('/api/achievement/check')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)

      // 应该解锁 5kg 减重成就
      const weightLoss5kg = response.body.newAchievements.find(
        (a: any) => a.type === ACHIEVEMENT_TYPES.WEIGHT_LOSS_5KG
      )
      expect(weightLoss5kg).toBeDefined()
    })

    it('should check goal achieved', async () => {
      // 创建目标
      await request(app)
        .post('/api/goal')
        .set('Authorization', `Bearer ${token}`)
        .send({
          startWeight: 75.0,
          targetWeight: 70.0,
          startDate: '2024-03-01',
          endDate: '2024-06-01'
        })

      // 创建达到目标的体重记录
      await request(app)
        .post('/api/weight')
        .set('Authorization', `Bearer ${token}`)
        .send({
          date: new Date().toISOString(),
          weight: 69.5
        })

      const response = await request(app)
        .get('/api/achievement/check')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)

      // 应该解锁目标达成成就
      const goalAchieved = response.body.newAchievements.find(
        (a: any) => a.type === ACHIEVEMENT_TYPES.GOAL_ACHIEVED
      )
      expect(goalAchieved).toBeDefined()
    })

    it('should not unlock duplicate achievements', async () => {
      // 第二次检查不应该解锁已有的成就
      const response = await request(app)
        .get('/api/achievement/check')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.newAchievements.length).toBe(0)
    })

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/achievement/check')

      expect(response.status).toBe(401)
    })
  })

  describe('POST /api/achievement/sync', () => {
    it('should sync achievements', async () => {
      const achievements = [
        {
          type: ACHIEVEMENT_TYPES.WEEK_STREAK
        },
        {
          type: ACHIEVEMENT_TYPES.MONTH_STREAK
        }
      ]

      const response = await request(app)
        .post('/api/achievement/sync')
        .set('Authorization', `Bearer ${token}`)
        .send({ achievements })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(Array.isArray(response.body.synced)).toBe(true)
      expect(response.body.synced.length).toBe(2)
    })

    it('should skip duplicate achievements during sync', async () => {
      const achievements = [
        {
          type: ACHIEVEMENT_TYPES.WEEK_STREAK
        }
      ]

      const response = await request(app)
        .post('/api/achievement/sync')
        .set('Authorization', `Bearer ${token}`)
        .send({ achievements })

      expect(response.status).toBe(200)
      // 应该跳过已存在的成就
      expect(response.body.synced.length).toBe(0)
    })

    it('should fail with invalid data', async () => {
      const response = await request(app)
        .post('/api/achievement/sync')
        .set('Authorization', `Bearer ${token}`)
        .send({ achievements: 'invalid' })

      expect(response.status).toBe(400)
    })

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/achievement/sync')
        .send({ achievements: [] })

      expect(response.status).toBe(401)
    })
  })
})
