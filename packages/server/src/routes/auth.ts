import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { AppError } from '../middleware/errorHandler'
import { authenticate, AuthRequest } from '../middleware/auth'
import { authLimiter } from '../middleware/rateLimiter'

const router = Router()
const prisma = new PrismaClient()

// POST /api/auth/send-code - Send verification code (mock implementation)
router.post('/send-code', authLimiter, async (req, res, next) => {
  try {
    const { phone } = req.body
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      throw new AppError('Invalid phone number', 400)
    }

    // Mock: In production, integrate with SMS service
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // Store code in cache/redis (mock: just return success)
    res.json({ success: true, message: 'Verification code sent' })
  } catch (error) {
    next(error)
  }
})

// POST /api/auth/verify-code - Verify code and login
router.post('/verify-code', authLimiter, async (req, res, next) => {
  try {
    const { phone, code } = req.body
    if (!phone || !code) {
      throw new AppError('Phone and code are required', 400)
    }

    // Mock verification (in production, verify against stored code)
    if (code !== '123456') {
      throw new AppError('Invalid verification code', 400)
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { phone } })
    if (!user) {
      user = await prisma.user.create({
        data: { phone },
      })
    }

    // Generate JWT
    const secret = process.env.JWT_SECRET
    if (!secret) throw new AppError('JWT secret not configured', 500)

    const token = jwt.sign(
      { userId: user.id },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar,
      },
    })
  } catch (error) {
    next(error)
  }
})

// POST /api/auth/wechat-login - WeChat mini-program login
router.post('/wechat-login', authLimiter, async (req, res, next) => {
  try {
    const { code } = req.body
    if (!code) {
      throw new AppError('WeChat code is required', 400)
    }

    // Mock: In production, call WeChat API to get openId
    const mockOpenId = `wx_${Date.now()}`

    // Find or create user
    let user = await prisma.user.findUnique({ where: { wechatOpenId: mockOpenId } })
    if (!user) {
      user = await prisma.user.create({
        data: { wechatOpenId: mockOpenId },
      })
    }

    // Generate JWT
    const secret = process.env.JWT_SECRET
    if (!secret) throw new AppError('JWT secret not configured', 500)

    const token = jwt.sign(
      { userId: user.id },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        wechatOpenId: user.wechatOpenId,
        nickname: user.nickname,
        avatar: user.avatar,
      },
    })
  } catch (error) {
    next(error)
  }
})

// POST /api/auth/refresh - Refresh token
router.post('/refresh', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId
    if (!userId) throw new AppError('User not authenticated', 401)

    const secret = process.env.JWT_SECRET
    if (!secret) throw new AppError('JWT secret not configured', 500)

    const token = jwt.sign({ userId }, secret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    })

    res.json({ success: true, token })
  } catch (error) {
    next(error)
  }
})

// GET /api/auth/me - Get current user
router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId
    if (!userId) throw new AppError('User not authenticated', 401)

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        wechatOpenId: true,
        nickname: true,
        avatar: true,
        height: true,
        gender: true,
        createdAt: true,
      },
    })

    if (!user) throw new AppError('User not found', 404)

    res.json({ success: true, user })
  } catch (error) {
    next(error)
  }
})

// POST /api/auth/logout - Logout (client-side token removal)
router.post('/logout', authenticate, async (req, res, next) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // Optionally, implement token blacklist here
    res.json({ success: true, message: 'Logged out successfully' })
  } catch (error) {
    next(error)
  }
})

export default router
