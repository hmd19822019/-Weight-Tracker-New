const dotenv = require('dotenv')
const path = require('path')

// 在所有模块加载之前加载测试环境变量
dotenv.config({ path: path.resolve(__dirname, '.env.test') })

console.log('Test environment loaded:', {
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET ? '***' : 'NOT SET'
})
