import request from 'supertest'
import { app } from '../index'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

describe('Auth Routes', () => {
  beforeAll(async () => {
    // 清理测试数据
    await prisma.user.deleteMany({
      where: {
        phone: { startsWith: '1380000' }
      }
    })
  })

  afterAll(async () => {
    // 清理测试数据
    await prisma.user.deleteMany({
      where: {
        phone: { startsWith: '1380000' }
      }
    })
    await prisma.$disconnect()
  })

  describe('POST /api/auth/register', () => {
    it('should register a new user with phone', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          phone: '13800000001',
          password: 'Test123456',
          nickname: 'Test User'
        })

      if (response.status !== 201) {
        console.log('Register failed:', {
          status: response.status,
          body: response.body,
          text: response.text
        })
      }

      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.user).toHaveProperty('id')
      expect(response.body.user.phone).toBe('13800000001')
      expect(response.body.user.nickname).toBe('Test User')
      expect(response.body).toHaveProperty('token')
      expect(response.body).toHaveProperty('refreshToken')
    })

    it('should fail with duplicate phone', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          phone: '13800000001',
          password: 'Test123456'
        })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })

    it('should fail with invalid phone format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          phone: '123',
          password: 'Test123456'
        })

      expect(response.status).toBe(400)
    })

    it('should fail without required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({})

      expect(response.status).toBe(400)
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phone: '13800000001',
          password: 'Test123456'
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.user.phone).toBe('13800000001')
      expect(response.body).toHaveProperty('token')
      expect(response.body).toHaveProperty('refreshToken')
    })

    it('should fail with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phone: '13800000001',
          password: 'WrongPassword'
        })

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
    })

    it('should fail with non-existent phone', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phone: '13800000099',
          password: 'Test123456'
        })

      expect(response.status).toBe(401)
    })
  })

  describe('GET /api/auth/me', () => {
    let token: string

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phone: '13800000001',
          password: 'Test123456'
        })
      token = response.body.token
    })

    it('should get current user with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.user.phone).toBe('13800000001')
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

  describe('PUT /api/auth/profile', () => {
    let token: string

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phone: '13800000001',
          password: 'Test123456'
        })
      token = response.body.token
    })

    it('should update user profile', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nickname: 'Updated User',
          height: 175,
          gender: 'male'
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.user.nickname).toBe('Updated User')
      expect(response.body.user.height).toBe(175)
      expect(response.body.user.gender).toBe('male')
    })

    it('should fail without token', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .send({
          nickname: 'Test'
        })

      expect(response.status).toBe(401)
    })
  })

  describe('POST /api/auth/refresh', () => {
    let refreshToken: string

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phone: '13800000001',
          password: 'Test123456'
        })
      refreshToken = response.body.refreshToken
    })

    it('should refresh token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body).toHaveProperty('token')
      expect(response.body).toHaveProperty('refreshToken')
    })

    it('should fail with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: 'invalid_token'
        })

      expect(response.status).toBe(401)
    })
  })
})
