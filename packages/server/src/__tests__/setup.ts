import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 在所有测试之前运行一次（全局清理）
beforeAll(async () => {
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
})

export { prisma }
