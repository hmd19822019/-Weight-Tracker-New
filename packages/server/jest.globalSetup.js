const dotenv = require('dotenv')
const path = require('path')

dotenv.config({ path: path.resolve(__dirname, '.env.test') })

module.exports = async () => {
  const { PrismaClient } = require('@prisma/client')
  const prisma = new PrismaClient()

  // 全局清理：在所有测试套件开始前运行一次
  await prisma.achievement.deleteMany({})
  await prisma.goal.deleteMany({})
  await prisma.foodRecord.deleteMany({})
  await prisma.waterIntake.deleteMany({})
  await prisma.weightRecord.deleteMany({})
  await prisma.settings.deleteMany({})
  await prisma.user.deleteMany({
    where: {
      phone: { startsWith: '13800000' }
    }
  })
  await prisma.$disconnect()
}
