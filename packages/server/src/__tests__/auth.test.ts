import request from 'supertest'
import { app } from '../index'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

describe('Auth Routes', () => {
  const testPhone = '13800000001'
  let token: string
  let userId: string

  beforeAll(async () => {
    // 清理测试数据
    await prisma.user.deleteMany({
      where: {
        phone: { startsWith: '13800000' }
      }
    })
  })

  afterAll(async () => {
    // 清理测试数据
    await prisma.user.deleteMany({
      where: {
        phone: { startsWith: '13800000' }
      }
    })
    await prisma.$disconnect()
  })

  describe('POST /api/auth/send-code', () => {
    it('should send verification code for valid phone', async () => {
      const response = await request(app)
        .post('/api/auth/send-code')
        .send({
          phone: testPhone
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('Verification code sent')
    })

    it('should fail with invalid phone format', async () => {
      const response = await request(app)
        .post('/api/auth/send-code')
        .send({
          phone: '123'
        })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })

    it('should fail without phone', async () => {
      const response = await request(app)
        .post('/api/auth/send-code')
        .send({})

      expect(response.status).toBe(400)
    })
  })

  describe('POST /api/auth/verify-code', () => {
    it('should verify code and create new user', async () => {
      const response = await request(app)
        .post('/api/auth/verify-code')
        .send({
          phone: testPhone,
          code: '123456'
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body).toHaveProperty('token')
      expect(response.body.user).toHaveProperty('id')
      expect(response.body.user.phone).toBe(testPhone)

      token = response.body.token
      userId = response.body.user.id
    })

    it('should login existing user with correct code', async () => {
      const response = await request(app)
        .post('/api/auth/verify-code')
        .send({
          phone: testPhone,
          code: '123456'
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.user.id).toBe(userId)
    })

    it('should fail with wrong verification code', async () => {
      const response = await request(app)
        .post('/api/auth/verify-code')
        .send({
          phone: testPhone,
          code: '000000'
        })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })

    it('should fail without required fields', async () => {
      const response = await request(app)
        .post('/api/auth/verify-code')
        .send({
          phone: testPhone
        })

      expect(response.status).toBe(400)
    })
  })

  describe('POST /api/auth/wechat-login', () => {
    it('should login with wechat code', async () => {
      const response = await request(app)
        .post('/api/auth/wechat-login')
        .send({
          code: 'mock-wechat-code'
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body).toHaveProperty('token')
      expect(response.body.user).toHaveProperty('id')
      expect(response.body.user).toHaveProperty('wechatOpenId')
    })

    it('should fail without code', async () => {
      const response = await request(app)
        .post('/api/auth/wechat-login')
        .send({})

      expect(response.status).toBe(400)
    })
  })

  describe('GET /api/auth/me', () => {
    it('should get current user with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.user.id).toBe(userId)
      expect(response.body.user.phone).toBe(testPhone)
    })

    it('should fail without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')

      expect(response.status).toBe(401)
    })

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token')

      expect(response.status).toBe(401)
    })
  })

  describe('POST /api/auth/refresh', () => {
    it('should refresh token with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body).toHaveProperty('token')

      // 更新 token 供后续测试使用
      token = response.body.token
    })

    it('should fail without token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')

      expect(response.status).toBe(401)
    })

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', 'Bearer invalid_token')

      expect(response.status).toBe(401)
    })
  })

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('Logged out successfully')
    })

    it('should fail without token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')

      expect(response.status).toBe(401)
    })
  })
})
