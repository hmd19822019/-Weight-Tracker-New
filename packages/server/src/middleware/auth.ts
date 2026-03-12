import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AppError } from './errorHandler'

export interface AuthRequest extends Request {
  userId?: string
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401)
    }

    const token = authHeader.substring(7)
    const secret = process.env.JWT_SECRET
    if (!secret) {
      throw new AppError('JWT secret not configured', 500)
    }

    const decoded = jwt.verify(token, secret) as { userId: string }
    req.userId = decoded.userId
    next()
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      next(new AppError('Invalid token', 401))
    } else if (error.name === 'TokenExpiredError') {
      next(new AppError('Token expired', 401))
    } else {
      next(error)
    }
  }
}
