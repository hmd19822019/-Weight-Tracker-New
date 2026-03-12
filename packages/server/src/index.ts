import express, { Express } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { errorHandler } from './middleware/errorHandler'
import { generalLimiter } from './middleware/rateLimiter'
import { logger } from './utils/logger'
import authRoutes from './routes/auth'
import weightRoutes from './routes/weight'

dotenv.config()

const app: Express = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(generalLimiter)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/weight', weightRoutes)

// Error handler (must be last)
app.use(errorHandler)

export { app }

if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`🚀 Server running on http://localhost:${PORT}`)
  })
}
