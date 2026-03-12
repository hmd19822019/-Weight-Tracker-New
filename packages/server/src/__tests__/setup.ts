import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 在所有测试之前运行
beforeAll(async () => {
  // 清理所有测试数据
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
})

// 在所有测试之后运行
afterAll(async () => {
  await prisma.$disconnect()
})

export { prisma }
