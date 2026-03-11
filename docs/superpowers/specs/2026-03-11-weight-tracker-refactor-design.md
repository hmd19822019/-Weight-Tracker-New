# 体重管理 App 重构设计方案

**日期**: 2026-03-11
**版本**: 1.0
**状态**: 待审核

## 1. 项目概述

### 1.1 背景

现有体重管理应用基于 Apache Cordova 开发，采用纯前端架构（HTML5 + JavaScript + localStorage）。存在以下问题：

- 技术栈老旧，Cordova 生态逐渐衰落
- 代码可维护性差（3000+ 行单文件 index.js）
- 缺乏类型安全（纯 JavaScript）
- 无法跨平台扩展（仅支持 Android）
- 数据仅存本地，无云端备份

### 1.2 重构目标

1. 技术栈现代化：从 Cordova 迁移到 React Native + Taro
2. 跨平台支持：iOS/Android App + 微信/支付宝小程序
3. 保留全部功能：5 个主 Tab + 成就系统 + AI 食物识别
4. 数据策略升级：本地优先 + 可选云备份
5. 代码质量提升：TypeScript + 模块化 + 测试覆盖

### 1.3 成功标准

- 代码复用率达到 50-70%（业务逻辑层）
- 应用性能不低于现有版本
- 数据迁移成功率 > 99%
- 用户留存率不下降
- 开发周期控制在 3-4.5 个月

## 2. 技术方案

### 2.1 技术栈选型

**最终选择：React Native + Taro**

理由：
- 平衡性最好：性能、开发效率、生态都优秀
- 技术栈统一：都基于 React + TypeScript
- 业务逻辑可共享：抽取 50-70% 代码到 shared 包
- 未来扩展性强

### 2.2 架构设计

**Monorepo 结构**：

```
weight-tracker/
├── packages/
│   ├── mobile/       # React Native App
│   ├── miniapp/      # Taro 小程序
│   ├── shared/       # 共享代码层
│   └── server/       # Node.js 后端
├── package.json
└── pnpm-workspace.yaml
```

**技术栈明细**：

移动端（React Native）：
- React Native 0.74+
- React Navigation 6.x
- Zustand（状态管理）
- React Native Chart Kit（图表）
- React Native Image Picker（拍照）
- AsyncStorage（本地存储）

小程序端（Taro）：
- Taro 3.6+
- Taro UI（组件库）
- Zustand（状态管理）
- ECharts for Taro（图表）

共享层（Shared）：
- TypeScript 5.x
- Zod（运行时类型校验）
- Day.js（日期处理）

后端（Server）：
- Node.js 20+ + Express
- Prisma + PostgreSQL
- JWT（用户认证）
- 百度 AI SDK（食物识别）
- 阿里云 OSS（图片存储）

### 2.3 数据流

```
用户操作
  ↓
UI 层（RN/Taro 组件）
  ↓
业务逻辑层（Shared Hooks）
  ↓
本地存储（AsyncStorage/Taro Storage）
  ↓（可选同步）
API 服务层（Shared Services）
  ↓
后端 API（Express）
  ↓
数据库（PostgreSQL）
```

**数据同步策略**：
- 所有数据先写入本地存储（立即生效）
- 用户已登录时，自动加入同步队列
- 后台定期同步（网络可用时）
- 冲突解决：服务端时间戳优先

## 3. 数据模型

### 3.1 核心类型定义

**WeightRecord（体重记录）**：
```typescript
interface WeightRecord {
  id: string
  userId?: string
  date: Date
  weight: number               // kg
  bodyFat?: number            // %
  notes?: string
  photoUrl?: string
  localPhotoUri?: string
  syncStatus: 'local' | 'synced' | 'pending'
  createdAt: Date
  updatedAt: Date
}
```

**WaterIntake（饮水记录）**：
```typescript
interface WaterIntake {
  id: string
  userId?: string
  date: string                // YYYY-MM-DD
  amount: number              // ml
  target: number              // ml
  syncStatus: 'local' | 'synced' | 'pending'
}
```

**FoodRecord（食物记录）**：
```typescript
interface FoodRecord {
  id: string
  userId?: string
  date: Date
  name: string
  calories: number
  photoUrl?: string
  confidence?: number
  syncStatus: 'local' | 'synced' | 'pending'
}
```

**UserGoal（用户目标）**：
```typescript
interface UserGoal {
  id: string
  userId?: string
  startWeight: number
  targetWeight: number
  startDate: Date
  endDate: Date
  syncStatus: 'local' | 'synced' | 'pending'
}
```

**Achievement（成就）**：
```typescript
interface Achievement {
  id: string
  type: 'first_record' | 'streak_7' | 'streak_30' | ...
  unlockedAt: Date
  syncStatus: 'local' | 'synced' | 'pending'
}
```

**User（用户信息）**：
```typescript
interface User {
  id: string
  phone?: string
  wechatOpenId?: string
  nickname?: string
  avatar?: string
  height?: number             // cm
  gender?: 'male' | 'female'
  createdAt: Date
}
```

### 3.2 数据库 Schema（Prisma）

```prisma
// prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String    @id @default(uuid())
  phone         String?   @unique
  phoneVerified Boolean   @default(false)
  passwordHash  String?
  wechatOpenId  String?   @unique
  nickname      String?
  avatar        String?
  height        Int?      // cm
  gender        String?   // 'male' | 'female'
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastLoginAt   DateTime?

  weightRecords WeightRecord[]
  waterIntakes  WaterIntake[]
  foodRecords   FoodRecord[]
  goals         Goal[]
  achievements  Achievement[]
  settings      Settings?

  @@index([phone])
  @@index([wechatOpenId])
}

model WeightRecord {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  date        DateTime
  weight      Float    // kg
  bodyFat     Float?   // %
  notes       String?  @db.Text
  photoUrl    String?
  version     Int      @default(1)  // 用于冲突解决
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId, date(sort: Desc)])
  @@index([userId, updatedAt])
}

model WaterIntake {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  date      String   // YYYY-MM-DD
  amount    Int      // ml
  target    Int      // ml
  version   Int      @default(1)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, date])
  @@index([userId, date(sort: Desc)])
}

model FoodRecord {
  id         String   @id @default(uuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  date       DateTime
  name       String
  calories   Int
  photoUrl   String?
  confidence Float?   // AI 识别置信度 0-1
  version    Int      @default(1)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([userId, date(sort: Desc)])
}

model Goal {
  id           String   @id @default(uuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  startWeight  Float
  targetWeight Float
  startDate    DateTime
  endDate      DateTime
  isActive     Boolean  @default(true)
  version      Int      @default(1)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([userId, isActive])
}

model Achievement {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  type        String   // 'first_record', 'streak_7', 'streak_30', 'records_10', etc.
  unlockedAt  DateTime @default(now())

  @@unique([userId, type])
  @@index([userId])
}

model Settings {
  id            String   @id @default(uuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  darkMode      Boolean  @default(false)
  language      String   @default("zh")
  waterTarget   Int      @default(2000)
  calorieTarget Int      @default(2000)
  autoSync      Boolean  @default(true)
  updatedAt     DateTime @updatedAt
}
```

**索引策略**：
- 所有查询频繁的字段都添加索引
- 复合索引用于常见查询模式（userId + date）
- 降序索引用于时间倒序查询

**数据保留策略**：
- 用户数据永久保留（除非用户主动删除账号）
- 删除账号时级联删除所有关联数据
- 软删除不采用（简化实现）

## 4. UI 层设计

### 4.1 页面结构

**5 个主 Tab**：
1. **记录** - 体重录入、快速模板（晨起/运动后/睡前）、饮水追踪
2. **历史** - 记录列表、多维度筛选、全文搜索、月度统计
3. **统计** - 折线/柱状/面积图、时间范围选择、统计卡片、目标进度
4. **洞察** - AI 健康建议、BMI 分析、照片对比、线性回归趋势预测
5. **饮食** - 百度 AI 拍照识别、手动输入、每日卡路里汇总

**额外页面**：设置、目标设置、成就列表、登录、记录详情

### 4.2 组件复用策略

**完全共享**（纯逻辑）：
- 所有 Shared Hooks
- 工具函数（日期格式化、BMI 计算、趋势预测等）
- 类型定义
- 常量配置

**需要平台适配**：
- 图表组件（RN: react-native-chart-kit，Taro: ECharts）
- 相机组件（RN: react-native-image-picker，Taro: Taro.chooseImage）
- 存储组件（RN: AsyncStorage，Taro: Taro.setStorage）
- 导航组件（RN: React Navigation，Taro: Taro.navigateTo）

**平台差异抽象**：通过 PlatformAdapter 接口统一，各端分别实现。

### 4.3 状态管理（Zustand）

主要 Store：
- **weightStore**：体重记录管理（records, loading, syncStatus, addRecord, updateRecord, deleteRecord, syncRecords）
- **userStore**：用户状态（user, isLoggedIn, token, login, wechatLogin, logout, updateProfile）
- **settingsStore**：应用设置（darkMode, language, waterTarget, calorieTarget, autoSync, updateSettings）

### 4.4 深色模式

- RN：使用 useColorScheme() + React Navigation ThemeProvider
- Taro：使用 CSS 变量 + Taro.getSystemInfo() 检测系统主题

### 4.5 照片处理

- 拍照/选择：RN 用 react-native-image-picker，Taro 用 Taro.chooseMedia
- 压缩：统一压缩到 800x800，质量 80%
- 上传：本地先保存原图路径，后台上传到阿里云 OSS，失败时加入重试队列

## 5. 后端 API 设计

### 5.1 认证与安全架构

**认证机制**：JWT (JSON Web Token)

**认证流程**：

1. **手机号登录**：
   ```
   用户输入手机号 -> 发送验证码 -> 验证码校验 -> 生成 JWT Token
   ```

2. **微信小程序登录**：
   ```
   微信授权 -> 获取 code -> 后端调用微信 API 获取 openId -> 生成 JWT Token
   ```

**JWT Token 设计**：
```typescript
{
  userId: string
  phone?: string
  wechatOpenId?: string
  iat: number        // 签发时间
  exp: number        // 过期时间（7天）
}
```

**密码安全**：
- 使用 bcrypt 哈希密码（salt rounds: 10）
- 密码最小长度：8 位
- 不存储明文密码

**Token 刷新策略**：
- Access Token 有效期：7 天
- 过期前 1 天自动刷新（客户端静默刷新）
- 刷新失败则要求重新登录

**API 安全措施**：

1. **HTTPS 强制**：
   - 生产环境强制 HTTPS
   - 使用 Let's Encrypt 免费证书

2. **CORS 配置**：
   ```typescript
   cors({
     origin: [
       'https://weight-tracker.app',
       'https://m.weight-tracker.app'
     ],
     credentials: true
   })
   ```

3. **速率限制**：
   ```typescript
   // 使用 express-rate-limit
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000,  // 15 分钟
     max: 100,                   // 最多 100 个请求
     message: '请求过于频繁，请稍后再试'
   })

   // 登录接口更严格
   const authLimiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 5,
     message: '登录尝试次数过多，请 15 分钟后再试'
   })
   ```

4. **输入验证**：
   ```typescript
   // 使用 Zod 进行运行时验证
   const createWeightRecordSchema = z.object({
     date: z.string().datetime(),
     weight: z.number().min(20).max(300),
     bodyFat: z.number().min(0).max(100).optional(),
     notes: z.string().max(500).optional()
   })
   ```

5. **SQL 注入防护**：
   - 使用 Prisma ORM（自动参数化查询）
   - 禁止原始 SQL 查询

6. **XSS 防护**：
   - 使用 helmet 中间件
   - Content-Security-Policy 头部
   - 用户输入内容转义

**环境变量管理**：
```bash
# .env.example
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@localhost:5432/weight_tracker
JWT_SECRET=<随机生成的 256 位密钥>
JWT_EXPIRES_IN=7d
BAIDU_API_KEY=<百度 AI API Key>
BAIDU_SECRET_KEY=<百度 AI Secret Key>
OSS_ACCESS_KEY_ID=<阿里云 OSS Access Key>
OSS_ACCESS_KEY_SECRET=<阿里云 OSS Secret>
WECHAT_APP_ID=<微信小程序 App ID>
WECHAT_APP_SECRET=<微信小程序 Secret>
```

**密钥管理**：
- 生产环境使用环境变量或密钥管理服务（如 AWS Secrets Manager）
- 开发环境使用 .env 文件（不提交到 Git）
- JWT_SECRET 使用 `openssl rand -base64 32` 生成

### 5.2 认证接口详细设计

```typescript
POST /api/auth/send-code
Body: { phone: string }
Response: { success: true, expiresIn: 300 }
限流: 1 次/分钟/手机号

POST /api/auth/verify-code
Body: { phone: string, code: string }
Response: { token: string, user: User }
限流: 5 次/15分钟/手机号

POST /api/auth/wechat-login
Body: { code: string }  // 微信授权 code
Response: { token: string, user: User }
说明: 后端调用微信 API 获取 openId，自动创建或登录用户

POST /api/auth/refresh-token
Headers: { Authorization: Bearer <token> }
Response: { token: string }
说明: 刷新 JWT Token

POST /api/auth/logout
Headers: { Authorization: Bearer <token> }
Response: { success: true }
说明: 客户端删除 Token（JWT 无状态，服务端不维护黑名单）

GET /api/auth/me
Headers: { Authorization: Bearer <token> }
Response: { user: User }
```

### 5.3 体重记录接口

```typescript
GET /api/weight-records
Headers: { Authorization: Bearer <token> }
Query: {
  startDate?: string,      // ISO 8601 格式
  endDate?: string,
  limit?: number,          // 默认 50，最大 200
  offset?: number
}
Response: {
  records: WeightRecord[],
  total: number,
  hasMore: boolean
}

POST /api/weight-records
Headers: { Authorization: Bearer <token> }
Body: {
  date: string,            // ISO 8601
  weight: number,          // 20-300
  bodyFat?: number,        // 0-100
  notes?: string,          // 最大 500 字符
  photo?: File             // multipart/form-data
}
Response: { record: WeightRecord }
验证: Zod schema 验证所有字段

PUT /api/weight-records/:id
Headers: { Authorization: Bearer <token> }
Body: Partial<WeightRecord>
Response: { record: WeightRecord }
权限: 只能更新自己的记录

DELETE /api/weight-records/:id
Headers: { Authorization: Bearer <token> }
Response: { success: true }
权限: 只能删除自己的记录

POST /api/weight-records/sync
Headers: { Authorization: Bearer <token> }
Body: {
  records: Array<{
    localId: string,
    date: string,
    weight: number,
    bodyFat?: number,
    notes?: string,
    version: number,
    updatedAt: string
  }>
}
Response: {
  synced: WeightRecord[],
  conflicts: Array<{
    localId: string,
    serverRecord: WeightRecord,
    reason: 'version_mismatch' | 'deleted_on_server'
  }>
}
说明: 批量同步，返回冲突列表供客户端处理
```

### 5.4 其他接口

```
GET/POST /api/water-intake/:date     # 饮水记录
POST     /api/water-intake/sync      # 批量同步
GET/POST /api/food-records           # 食物记录
POST     /api/food/recognize         # 百度 AI 食物识别
GET/POST /api/goals/active           # 目标管理
GET/POST /api/achievements           # 成就系统
GET/PUT  /api/settings               # 用户设置
POST     /api/upload/image           # 图片上传
```

### 5.4 中间件

- **authMiddleware**：JWT 验证
- **errorHandler**：统一错误处理
- **requestLogger**：请求日志

### 5.5 第三方服务集成

**百度 AI 食物识别**：

```typescript
// services/baiduAI.ts
import axios from 'axios'
import { logger } from '../utils/logger'

interface BaiduAIConfig {
  apiKey: string
  secretKey: string
  maxRetries: number
  timeout: number
}

interface FoodRecognitionResult {
  name: string
  calories: number
  confidence: number
  alternatives: Array<{ name: string; calories: number }>
}

class BaiduAIService {
  private accessToken: string | null = null
  private tokenExpiry: number = 0
  private config: BaiduAIConfig

  constructor(config: BaiduAIConfig) {
    this.config = config
  }

  // 获取 Access Token（带缓存和重试）
  async getAccessToken(): Promise<string> {
    // 如果 token 未过期，直接返回
    if (this.accessToken && Date.now() < this.tokenExpiry - 60000) {
      return this.accessToken
    }

    let lastError: Error | null = null

    // 重试机制
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        logger.info(`Fetching Baidu AI access token (attempt ${attempt})`)

        const response = await axios.post(
          'https://aip.baidubce.com/oauth/2.0/token',
          null,
          {
            params: {
              grant_type: 'client_credentials',
              client_id: this.config.apiKey,
              client_secret: this.config.secretKey
            },
            timeout: this.config.timeout
          }
        )

        if (!response.data.access_token) {
          throw new Error('Access token not found in response')
        }

        this.accessToken = response.data.access_token
        this.tokenExpiry = Date.now() + response.data.expires_in * 1000

        logger.info('Baidu AI access token fetched successfully')
        return this.accessToken

      } catch (error) {
        lastError = error as Error
        logger.error(`Failed to fetch access token (attempt ${attempt}):`, error)

        // 如果不是最后一次尝试，等待后重试
        if (attempt < this.config.maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    throw new Error(`Failed to get Baidu AI access token after ${this.config.maxRetries} attempts: ${lastError?.message}`)
  }

  // 识别食物（带错误处理和降级）
  async recognizeFood(imageBase64: string): Promise<FoodRecognitionResult> {
    // 验证输入
    if (!imageBase64 || imageBase64.length === 0) {
      throw new Error('Image data is empty')
    }

    // 检查图片大小（最大 4MB）
    const sizeInBytes = (imageBase64.length * 3) / 4
    if (sizeInBytes > 4 * 1024 * 1024) {
      throw new Error('Image size exceeds 4MB limit')
    }

    let lastError: Error | null = null

    // 重试机制
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        const token = await this.getAccessToken()

        logger.info(`Recognizing food (attempt ${attempt})`)

        const response = await axios.post(
          `https://aip.baidubce.com/rest/2.0/image-classify/v2/dish?access_token=${token}`,
          `image=${encodeURIComponent(imageBase64)}`,
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            timeout: this.config.timeout
          }
        )

        // 检查 API 错误
        if (response.data.error_code) {
          throw new Error(`Baidu AI API error: ${response.data.error_msg} (code: ${response.data.error_code})`)
        }

        // 检查结果
        if (!response.data.result || response.data.result.length === 0) {
          logger.warn('No food recognized in image')
          return {
            name: '',
            calories: 0,
            confidence: 0,
            alternatives: []
          }
        }

        const topResult = response.data.result[0]
        const alternatives = response.data.result.slice(1, 4).map((item: any) => ({
          name: item.name,
          calories: item.calorie || 0
        }))

        logger.info(`Food recognized: ${topResult.name} (confidence: ${topResult.probability})`)

        return {
          name: topResult.name,
          calories: topResult.calorie || 0,
          confidence: topResult.probability,
          alternatives
        }

      } catch (error) {
        lastError = error as Error
        logger.error(`Food recognition failed (attempt ${attempt}):`, error)

        // 特定错误不重试
        if (axios.isAxiosError(error)) {
          // 客户端错误（4xx）不重试
          if (error.response?.status && error.response.status >= 400 && error.response.status < 500) {
            break
          }
        }

        // 如果不是最后一次尝试，等待后重试
        if (attempt < this.config.maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    // 所有重试失败，抛出错误
    throw new Error(`Food recognition failed after ${this.config.maxRetries} attempts: ${lastError?.message}`)
  }

  // 带降级的识别方法（推荐使用）
  async recognizeFoodWithFallback(imageBase64: string): Promise<FoodRecognitionResult & { needsManualInput?: boolean }> {
    try {
      return await this.recognizeFood(imageBase64)
    } catch (error) {
      logger.error('Food recognition failed, falling back to manual input:', error)

      // 返回空结果，标记需要手动输入
      return {
        name: '',
        calories: 0,
        confidence: 0,
        alternatives: [],
        needsManualInput: true
      }
    }
  }

  // 健康检查
  async healthCheck(): Promise<boolean> {
    try {
      await this.getAccessToken()
      return true
    } catch (error) {
      logger.error('Baidu AI health check failed:', error)
      return false
    }
  }
}

// 导出单例
export default new BaiduAIService({
  apiKey: process.env.BAIDU_API_KEY!,
  secretKey: process.env.BAIDU_SECRET_KEY!,
  maxRetries: 3,
  timeout: 10000
})
```

**API 路由实现**：

```typescript
// routes/food.ts
import express from 'express'
import multer from 'multer'
import baiduAI from '../services/baiduAI'
import { authMiddleware } from '../middleware/auth'
import { logger } from '../utils/logger'

const router = express.Router()
const upload = multer({ limits: { fileSize: 4 * 1024 * 1024 } })

router.post('/recognize', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' })
    }

    // 转换为 base64
    const imageBase64 = req.file.buffer.toString('base64')

    // 调用百度 AI（带降级）
    const result = await baiduAI.recognizeFoodWithFallback(imageBase64)

    // 记录使用情况（用于成本监控）
    logger.info('Food recognition request', {
      userId: req.userId,
      success: !result.needsManualInput,
      confidence: result.confidence
    })

    res.json(result)

  } catch (error) {
    logger.error('Food recognition endpoint error:', error)
    res.status(500).json({
      error: 'Food recognition failed',
      needsManualInput: true
    })
  }
})

export default router
```

**成本监控**：

```typescript
// 每日 API 调用统计
interface APIUsageStats {
  date: string
  totalCalls: number
  successfulCalls: number
  failedCalls: number
  averageConfidence: number
}

// 定期记录到数据库或日志
async function trackAPIUsage(userId: string, success: boolean, confidence: number) {
  // 记录到 Redis 或数据库
  await redis.hincrby(`api_usage:${new Date().toISOString().split('T')[0]}`, 'total', 1)
  if (success) {
    await redis.hincrby(`api_usage:${new Date().toISOString().split('T')[0]}`, 'success', 1)
  }
}
```

**阿里云 OSS**：
- 图片上传到 weight-tracker/{timestamp}-{filename}
- 返回公开访问 URL

## 6. 开发流程与部署

### 6.1 Monorepo 配置

使用 pnpm workspace 管理多包：
- pnpm-workspace.yaml 声明 packages/*
- 根目录 package.json 提供统一脚本
- shared 包通过 workspace:* 引用

### 6.2 开发命令

```bash
pnpm dev:mobile      # 启动 React Native
pnpm dev:miniapp     # 启动 Taro 小程序
pnpm dev:server      # 启动后端服务
pnpm build:android   # 构建 Android APK
pnpm build:ios       # 构建 iOS
pnpm build:miniapp   # 构建小程序
pnpm test            # 运行所有测试
pnpm type-check      # TypeScript 类型检查
```

### 6.3 部署方案

**后端**：阿里云 ECS + Docker + PostgreSQL
- 使用 docker-compose 管理服务
- Nginx 反向代理 + HTTPS

**移动端发布**：
- Android：Gradle 构建签名 APK，发布到应用商店
- iOS：Xcode 构建，发布到 App Store

**小程序发布**：
- 微信开发者工具上传代码
- 提交审核后发布

### 6.4 CI/CD 配置（GitHub Actions）

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '20'
  PNPM_VERSION: '8'

jobs:
  # 1. 代码质量检查
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Type check
        run: pnpm type-check

  # 2. 单元测试和集成测试
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: weight_tracker_test
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run database migrations
        run: pnpm --filter server prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/weight_tracker_test

      - name: Run tests
        run: pnpm test --coverage
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/weight_tracker_test

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  # 3. 构建 Android APK
  build-android:
    needs: [lint-and-typecheck, test]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'

    steps:
      - uses: actions/checkout@v3

      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build Android APK
        run: |
          cd packages/mobile/android
          ./gradlew assembleRelease
        env:
          MYAPP_RELEASE_STORE_FILE: ${{ secrets.ANDROID_KEYSTORE_FILE }}
          MYAPP_RELEASE_KEY_ALIAS: ${{ secrets.ANDROID_KEY_ALIAS }}
          MYAPP_RELEASE_STORE_PASSWORD: ${{ secrets.ANDROID_STORE_PASSWORD }}
          MYAPP_RELEASE_KEY_PASSWORD: ${{ secrets.ANDROID_KEY_PASSWORD }}

      - name: Upload APK artifact
        uses: actions/upload-artifact@v3
        with:
          name: app-release-${{ github.sha }}
          path: packages/mobile/android/app/build/outputs/apk/release/app-release.apk
          retention-days: 30

  # 4. 构建小程序
  build-miniapp:
    needs: [lint-and-typecheck, test]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build WeChat MiniApp
        run: pnpm --filter miniapp build:weapp

      - name: Upload MiniApp artifact
        uses: actions/upload-artifact@v3
        with:
          name: miniapp-weapp-${{ github.sha }}
          path: packages/miniapp/dist/
          retention-days: 30

  # 5. 部署后端服务
  deploy-server:
    needs: [lint-and-typecheck, test]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to Docker Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ secrets.DOCKER_REGISTRY }}
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: ./packages/server
          push: true
          tags: |
            ${{ secrets.DOCKER_REGISTRY }}/weight-tracker-server:latest
            ${{ secrets.DOCKER_REGISTRY }}/weight-tracker-server:${{ github.sha }}
          cache-from: type=registry,ref=${{ secrets.DOCKER_REGISTRY }}/weight-tracker-server:buildcache
          cache-to: type=registry,ref=${{ secrets.DOCKER_REGISTRY }}/weight-tracker-server:buildcache,mode=max

      - name: Deploy to production server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.PROD_SERVER_HOST }}
          username: ${{ secrets.PROD_SERVER_USER }}
          key: ${{ secrets.PROD_SERVER_SSH_KEY }}
          script: |
            cd /opt/weight-tracker
            docker-compose pull
            docker-compose up -d
            docker-compose exec -T server pnpm prisma migrate deploy

  # 6. E2E 测试（可选，仅在 main 分支）
  e2e-test:
    needs: [build-android]
    runs-on: macos-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Detox CLI
        run: npm install -g detox-cli

      - name: Build Detox
        run: cd packages/mobile && detox build --configuration ios.sim.release

      - name: Run Detox tests
        run: cd packages/mobile && detox test --configuration ios.sim.release --cleanup

      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: detox-artifacts
          path: packages/mobile/artifacts/
```

**部署流程说明**：

1. **PR 触发**：
   - 代码质量检查（Lint + TypeCheck）
   - 单元测试 + 集成测试
   - 测试覆盖率上传到 Codecov

2. **main 分支合并**：
   - 执行所有 PR 检查
   - 构建 Android APK（签名版本）
   - 构建小程序
   - 构建并推送 Docker 镜像
   - 自动部署到生产服务器
   - 运行数据库迁移
   - 可选：运行 E2E 测试

3. **develop 分支**：
   - 执行所有 PR 检查
   - 构建 Android APK（测试版本）
   - 不部署到生产环境

### 6.5 部署架构

**生产环境架构**：

```
                    ┌─────────────┐
                    │   Nginx     │
                    │  (反向代理)  │
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
       ┌──────▼──────┐          ┌──────▼──────┐
       │  Express    │          │  Express    │
       │  Server 1   │          │  Server 2   │
       └──────┬──────┘          └──────┬──────┘
              │                         │
              └────────────┬────────────┘
                           │
                    ┌──────▼──────┐
                    │ PostgreSQL  │
                    │   (主库)    │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ PostgreSQL  │
                    │  (从库备份) │
                    └─────────────┘

        ┌─────────────┐      ┌─────────────┐
        │ 阿里云 OSS  │      │  百度 AI    │
        │  (图片存储) │      │   (食物识别) │
        └─────────────┘      └─────────────┘
```

**Docker Compose 配置**：

```yaml
# docker-compose.yml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - server1
      - server2

  server1:
    image: ${DOCKER_REGISTRY}/weight-tracker-server:latest
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - BAIDU_API_KEY=${BAIDU_API_KEY}
      - OSS_ACCESS_KEY_ID=${OSS_ACCESS_KEY_ID}
    depends_on:
      - postgres

  server2:
    image: ${DOCKER_REGISTRY}/weight-tracker-server:latest
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - BAIDU_API_KEY=${BAIDU_API_KEY}
      - OSS_ACCESS_KEY_ID=${OSS_ACCESS_KEY_ID}
    depends_on:
      - postgres

  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=weight_tracker
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    ports:
      - "5432:5432"

  postgres_backup:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=weight_tracker
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_backup_data:/var/lib/postgresql/data
    command: >
      bash -c "
        while true; do
          pg_basebackup -h postgres -U ${DB_USER} -D /var/lib/postgresql/data -Fp -Xs -P
          sleep 3600
        done
      "

volumes:
  postgres_data:
  postgres_backup_data:
```

**Nginx 配置**：

```nginx
# nginx.conf
upstream backend {
    least_conn;
    server server1:3001;
    server server2:3001;
}

server {
    listen 80;
    server_name api.weight-tracker.app;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.weight-tracker.app;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    # 安全头部
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # 限流
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;

    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 健康检查
    location /health {
        access_log off;
        proxy_pass http://backend/health;
    }
}
```

**回滚策略**：

```bash
# 回滚脚本
#!/bin/bash

# 1. 获取上一个版本的镜像 tag
PREVIOUS_TAG=$(docker images --format "{{.Tag}}" ${DOCKER_REGISTRY}/weight-tracker-server | sed -n '2p')

# 2. 停止当前服务
docker-compose down

# 3. 更新 docker-compose.yml 使用上一个版本
sed -i "s/:latest/:${PREVIOUS_TAG}/g" docker-compose.yml

# 4. 启动服务
docker-compose up -d

# 5. 回滚数据库迁移（如果需要）
docker-compose exec server pnpm prisma migrate resolve --rolled-back <migration_name>

# 6. 验证服务健康
curl -f http://localhost/health || echo "Rollback failed!"
```

### 6.6 监控和告警

**监控指标**：

```typescript
// 使用 Prometheus + Grafana

// 1. API 响应时间
histogram('http_request_duration_seconds', {
  labels: ['method', 'route', 'status_code']
})

// 2. 数据库查询性能
histogram('db_query_duration_seconds', {
  labels: ['operation', 'table']
})

// 3. 同步成功率
counter('sync_requests_total', {
  labels: ['status']  // 'success' | 'failure'
})

// 4. 活跃用户数
gauge('active_users', {
  labels: ['platform']  // 'ios' | 'android' | 'miniapp'
})

// 5. 错误率
counter('errors_total', {
  labels: ['type', 'severity']
})
```

**告警规则**：

```yaml
# prometheus/alerts.yml
groups:
  - name: weight_tracker_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(errors_total[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "错误率过高"
          description: "过去 5 分钟错误率超过 5%"

      - alert: SlowAPIResponse
        expr: histogram_quantile(0.95, http_request_duration_seconds) > 2
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "API 响应缓慢"
          description: "95% 的请求响应时间超过 2 秒"

      - alert: DatabaseConnectionFailure
        expr: up{job="postgres"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "数据库连接失败"
          description: "PostgreSQL 数据库无法连接"

      - alert: LowSyncSuccessRate
        expr: rate(sync_requests_total{status="success"}[10m]) / rate(sync_requests_total[10m]) < 0.9
        for: 15m
        labels:
          severity: warning
        annotations:
          summary: "同步成功率低"
          description: "过去 15 分钟同步成功率低于 90%"
```

**日志聚合**：

```typescript
// 使用 Winston + Elasticsearch + Kibana

import winston from 'winston'
import { ElasticsearchTransport } from 'winston-elasticsearch'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new ElasticsearchTransport({
      level: 'info',
      clientOpts: { node: process.env.ELASTICSEARCH_URL },
      index: 'weight-tracker-logs'
    })
  ]
})

// 使用示例
logger.info('User logged in', {
  userId: '123',
  platform: 'ios',
  timestamp: new Date()
})

logger.error('Sync failed', {
  userId: '123',
  error: error.message,
  stack: error.stack
})
```

### 6.5 开发时间线

- **Phase 1（2-3周）**：基础架构搭建（Monorepo、共享层、后端框架、数据库）
- **Phase 2（4-6周）**：核心功能开发（体重记录、历史、统计、数据同步、用户认证）
- **Phase 3（3-4周）**：高级功能开发（洞察、食物识别、成就系统、照片管理）
- **Phase 4（2-3周）**：优化和测试（性能优化、UI/UX、单元测试、Bug 修复）
- **Phase 5（1-2周）**：发布准备（应用商店资料、小程序审核、部署监控）

**总计：12-18 周（3-4.5 个月）**

## 7. 迁移策略与风险管理

### 7.1 数据迁移方案

**从 Cordova localStorage 迁移到新系统**

**迁移流程**：

```typescript
// 1. 导出旧版数据
interface LegacyData {
  weightRecords: Array<{
    date: string
    weight: number
    note?: string
    bodyFat?: number
    photo?: string  // base64
  }>
  waterIntake: Record<string, { amount: number; target: number }>
  foodRecords: Array<{
    date: string
    name: string
    calories: number
    photo?: string
  }>
  userGoal?: {
    startWeight: number
    targetWeight: number
    startDate: string
    endDate: string
  }
  achievements: Record<string, boolean>
  settings: {
    darkMode: boolean
    language: string
    waterTarget: number
    calorieTarget: number
  }
}

// 2. 数据转换函数
async function migrateLegacyData(legacyData: LegacyData): Promise<MigrationResult> {
  const errors: MigrationError[] = []
  const warnings: string[] = []

  try {
    // 2.1 转换体重记录
    const weightRecords = legacyData.weightRecords
      .map((record, index) => {
        try {
          // 验证数据
          if (!record.date || !record.weight) {
            throw new Error(`记录 ${index} 缺少必填字段`)
          }

          const date = new Date(record.date)
          if (isNaN(date.getTime())) {
            throw new Error(`记录 ${index} 日期格式无效`)
          }

          if (record.weight < 20 || record.weight > 300) {
            throw new Error(`记录 ${index} 体重值超出范围`)
          }

          return {
            id: generateUUID(),
            date,
            weight: record.weight,
            bodyFat: record.bodyFat,
            notes: record.note,
            localPhotoUri: record.photo,  // 保留 base64，标记待上传
            syncStatus: 'local' as const,
            version: 1,
            createdAt: date,
            updatedAt: new Date()
          }
        } catch (error) {
          errors.push({
            type: 'weight_record',
            index,
            message: error.message,
            data: record
          })
          return null
        }
      })
      .filter(Boolean)

    // 2.2 转换饮水记录
    const waterIntakes = Object.entries(legacyData.waterIntake || {})
      .map(([date, data]) => {
        try {
          if (!isValidDate(date)) {
            throw new Error(`日期 ${date} 格式无效`)
          }

          return {
            id: generateUUID(),
            date,
            amount: data.amount || 0,
            target: data.target || 2000,
            syncStatus: 'local' as const,
            version: 1
          }
        } catch (error) {
          errors.push({
            type: 'water_intake',
            date,
            message: error.message,
            data
          })
          return null
        }
      })
      .filter(Boolean)

    // 2.3 转换食物记录
    const foodRecords = legacyData.foodRecords
      .map((record, index) => {
        try {
          const date = new Date(record.date)
          if (isNaN(date.getTime())) {
            throw new Error(`记录 ${index} 日期格式无效`)
          }

          return {
            id: generateUUID(),
            date,
            name: record.name || '未知食物',
            calories: record.calories || 0,
            localPhotoUri: record.photo,
            syncStatus: 'local' as const,
            version: 1
          }
        } catch (error) {
          errors.push({
            type: 'food_record',
            index,
            message: error.message,
            data: record
          })
          return null
        }
      })
      .filter(Boolean)

    // 2.4 转换目标
    let goal = null
    if (legacyData.userGoal) {
      try {
        goal = {
          id: generateUUID(),
          startWeight: legacyData.userGoal.startWeight,
          targetWeight: legacyData.userGoal.targetWeight,
          startDate: new Date(legacyData.userGoal.startDate),
          endDate: new Date(legacyData.userGoal.endDate),
          isActive: true,
          syncStatus: 'local' as const,
          version: 1
        }
      } catch (error) {
        errors.push({
          type: 'goal',
          message: error.message,
          data: legacyData.userGoal
        })
      }
    }

    // 2.5 转换成就
    const achievements = Object.entries(legacyData.achievements || {})
      .filter(([_, unlocked]) => unlocked)
      .map(([type]) => ({
        id: generateUUID(),
        type,
        unlockedAt: new Date(),
        syncStatus: 'local' as const
      }))

    // 2.6 转换设置
    const settings = {
      darkMode: legacyData.settings?.darkMode || false,
      language: legacyData.settings?.language || 'zh',
      waterTarget: legacyData.settings?.waterTarget || 2000,
      calorieTarget: legacyData.settings?.calorieTarget || 2000,
      autoSync: true
    }

    // 3. 保存到新存储
    await AsyncStorage.setItem('weight_records', JSON.stringify(weightRecords))
    await AsyncStorage.setItem('water_intake', JSON.stringify(waterIntakes))
    await AsyncStorage.setItem('food_records', JSON.stringify(foodRecords))
    if (goal) await AsyncStorage.setItem('user_goal', JSON.stringify(goal))
    await AsyncStorage.setItem('achievements', JSON.stringify(achievements))
    await AsyncStorage.setItem('settings', JSON.stringify(settings))

    // 4. 标记迁移完成
    await AsyncStorage.setItem('migration_completed', 'true')
    await AsyncStorage.setItem('migration_date', new Date().toISOString())

    return {
      success: true,
      stats: {
        weightRecords: weightRecords.length,
        waterIntakes: waterIntakes.length,
        foodRecords: foodRecords.length,
        achievements: achievements.length,
        errors: errors.length
      },
      errors,
      warnings
    }

  } catch (error) {
    return {
      success: false,
      error: error.message,
      errors
    }
  }
}

// 3. 错误处理和回滚
async function rollbackMigration() {
  const keys = [
    'weight_records',
    'water_intake',
    'food_records',
    'user_goal',
    'achievements',
    'settings',
    'migration_completed',
    'migration_date'
  ]

  await AsyncStorage.multiRemove(keys)
}

// 4. 数据校验
function validateMigratedData(data: any): ValidationResult {
  const issues: string[] = []

  // 检查必填字段
  if (!data.weightRecords || !Array.isArray(data.weightRecords)) {
    issues.push('体重记录数据格式错误')
  }

  // 检查数据完整性
  data.weightRecords?.forEach((record, index) => {
    if (!record.id || !record.date || !record.weight) {
      issues.push(`体重记录 ${index} 缺少必填字段`)
    }
  })

  return {
    valid: issues.length === 0,
    issues
  }
}
```

**迁移 UI 流程**：

1. **检测旧版数据**：
   - 应用启动时检查是否存在旧版 localStorage 数据
   - 如果存在且未迁移，显示迁移引导

2. **导出旧版数据**：
   - 用户点击"导出数据"按钮
   - 生成 JSON 文件保存到设备
   - 提示用户妥善保管备份文件

3. **导入到新版**：
   - 用户在新版 App 中选择"导入数据"
   - 选择之前导出的 JSON 文件
   - 显示导入进度条

4. **验证和确认**：
   - 显示导入结果统计
   - 列出任何错误或警告
   - 用户确认后完成迁移

5. **错误恢复**：
   - 如果迁移失败，提供"重试"和"回滚"选项
   - 回滚会清除所有新导入的数据
   - 保留原始导出文件供再次尝试

**迁移测试计划**：

```typescript
// 测试用例
describe('Data Migration', () => {
  test('应该成功迁移完整数据', async () => {
    const legacyData = createMockLegacyData()
    const result = await migrateLegacyData(legacyData)

    expect(result.success).toBe(true)
    expect(result.stats.weightRecords).toBe(100)
    expect(result.errors).toHaveLength(0)
  })

  test('应该处理损坏的日期数据', async () => {
    const legacyData = {
      weightRecords: [
        { date: 'invalid-date', weight: 65 }
      ]
    }
    const result = await migrateLegacyData(legacyData)

    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].type).toBe('weight_record')
  })

  test('应该跳过超出范围的体重值', async () => {
    const legacyData = {
      weightRecords: [
        { date: '2026-01-01', weight: 500 }  // 超出范围
      ]
    }
    const result = await migrateLegacyData(legacyData)

    expect(result.stats.weightRecords).toBe(0)
    expect(result.errors).toHaveLength(1)
  })

  test('应该成功回滚失败的迁移', async () => {
    await rollbackMigration()
    const data = await AsyncStorage.getItem('weight_records')
    expect(data).toBeNull()
  })
})
```

### 7.2 数据同步冲突解决

**冲突场景**：

1. **版本冲突**：客户端和服务端同一记录的版本号不一致
2. **时间戳冲突**：离线期间修改的记录与服务端记录冲突
3. **删除冲突**：客户端修改了服务端已删除的记录

**冲突解决算法**：

```typescript
interface SyncConflict {
  localRecord: WeightRecord
  serverRecord: WeightRecord
  conflictType: 'version_mismatch' | 'timestamp_conflict' | 'deleted_on_server'
}

async function resolveConflicts(
  conflicts: SyncConflict[]
): Promise<ResolvedConflict[]> {
  const resolved: ResolvedConflict[] = []

  for (const conflict of conflicts) {
    let resolution: ConflictResolution

    switch (conflict.conflictType) {
      case 'version_mismatch':
        // 策略：服务端版本号更高则采用服务端数据
        if (conflict.serverRecord.version > conflict.localRecord.version) {
          resolution = {
            action: 'use_server',
            record: conflict.serverRecord,
            reason: '服务端数据更新'
          }
        } else {
          // 本地版本更高，尝试强制更新服务端
          resolution = {
            action: 'force_update_server',
            record: conflict.localRecord,
            reason: '本地数据更新'
          }
        }
        break

      case 'timestamp_conflict':
        // 策略：最后修改时间优先（Last-Write-Wins）
        const localTime = new Date(conflict.localRecord.updatedAt).getTime()
        const serverTime = new Date(conflict.serverRecord.updatedAt).getTime()

        if (serverTime > localTime) {
          resolution = {
            action: 'use_server',
            record: conflict.serverRecord,
            reason: '服务端修改时间更晚'
          }
        } else {
          resolution = {
            action: 'use_local',
            record: conflict.localRecord,
            reason: '本地修改时间更晚'
          }
        }
        break

      case 'deleted_on_server':
        // 策略：服务端删除优先，但保留本地副本供用户决定
        resolution = {
          action: 'mark_deleted_locally',
          record: conflict.localRecord,
          reason: '服务端已删除此记录',
          requiresUserAction: true
        }
        break
    }

    resolved.push({
      conflict,
      resolution
    })
  }

  return resolved
}

// 应用冲突解决结果
async function applyConflictResolutions(
  resolutions: ResolvedConflict[]
): Promise<void> {
  for (const { resolution } of resolutions) {
    switch (resolution.action) {
      case 'use_server':
        // 用服务端数据覆盖本地
        await updateLocalRecord(resolution.record)
        break

      case 'use_local':
        // 用本地数据更新服务端
        await updateServerRecord(resolution.record)
        break

      case 'force_update_server':
        // 强制更新服务端（增加版本号）
        await forceUpdateServerRecord({
          ...resolution.record,
          version: resolution.record.version + 1
        })
        break

      case 'mark_deleted_locally':
        // 标记为已删除，但不立即删除
        await markRecordAsDeleted(resolution.record.id)
        // 通知用户有冲突需要处理
        await showConflictNotification(resolution)
        break
    }
  }
}
```

**同步队列管理**：

```typescript
interface SyncQueue {
  pending: SyncItem[]
  failed: SyncItem[]
  lastSyncTime: string
}

interface SyncItem {
  id: string
  type: 'weight_record' | 'water_intake' | 'food_record' | 'goal'
  action: 'create' | 'update' | 'delete'
  data: any
  retryCount: number
  lastAttempt: string
}

async function processSyncQueue(): Promise<SyncResult> {
  const queue = await getSyncQueue()
  const results: SyncItemResult[] = []

  for (const item of queue.pending) {
    try {
      // 根据类型和操作调用相应的 API
      const response = await syncItem(item)

      results.push({
        item,
        success: true,
        response
      })

      // 从队列中移除
      await removeSyncItem(item.id)

    } catch (error) {
      item.retryCount++
      item.lastAttempt = new Date().toISOString()

      if (item.retryCount >= 3) {
        // 重试次数过多，移到失败队列
        await moveToFailedQueue(item)
      } else {
        // 更新重试计数
        await updateSyncItem(item)
      }

      results.push({
        item,
        success: false,
        error: error.message
      })
    }
  }

  return {
    total: queue.pending.length,
    succeeded: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results
  }
}

// 自动同步触发条件
async function shouldAutoSync(): Promise<boolean> {
  const settings = await getSettings()
  if (!settings.autoSync) return false

  const isOnline = await NetInfo.fetch().then(state => state.isConnected)
  if (!isOnline) return false

  const lastSync = await getLastSyncTime()
  const timeSinceLastSync = Date.now() - new Date(lastSync).getTime()
  const syncInterval = 5 * 60 * 1000  // 5 分钟

  return timeSinceLastSync >= syncInterval
}
```

**用户可见的冲突处理 UI**：

```typescript
// 冲突通知组件
function ConflictNotification({ conflicts }: { conflicts: SyncConflict[] }) {
  return (
    <View>
      <Text>发现 {conflicts.length} 个数据冲突需要处理</Text>
      {conflicts.map(conflict => (
        <ConflictItem key={conflict.localRecord.id}>
          <Text>记录日期: {conflict.localRecord.date}</Text>
          <Text>本地: {conflict.localRecord.weight} kg</Text>
          <Text>服务端: {conflict.serverRecord.weight} kg</Text>
          <Button onPress={() => resolveConflict(conflict, 'use_local')}>
            使用本地数据
          </Button>
          <Button onPress={() => resolveConflict(conflict, 'use_server')}>
            使用服务端数据
          </Button>
        </ConflictItem>
      ))}
    </View>
  )
}
```

### 7.2 渐进式迁移策略

**阶段 1：双版本并行（1-2 个月）**
- 新版本发布到应用商店
- 旧版本继续维护（仅修复严重 bug）
- 用户可以选择继续使用旧版或升级

**阶段 2：引导迁移（2-3 个月）**
- 旧版本显示升级提示
- 提供一键迁移工具
- 新版本提供更多功能吸引用户

**阶段 3：停止维护旧版（3 个月后）**
- 旧版本不再更新
- 强制升级提示
- 保留数据导出功能至少 6 个月

### 7.3 风险识别与应对

**技术风险**：

| 风险 | 影响 | 概率 | 应对措施 |
|------|------|------|----------|
| React Native 升级破坏性变更 | 高 | 中 | 锁定版本，定期测试升级路径 |
| 百度 AI API 限流/失效 | 中 | 低 | 添加降级方案，支持手动输入 |
| 数据同步冲突 | 高 | 中 | 实现完善的冲突解决策略 |
| 图片存储成本过高 | 中 | 中 | 压缩图片，设置存储上限 |
| 小程序审核不通过 | 中 | 低 | 提前了解审核规则 |

**业务风险**：

| 风险 | 影响 | 概率 | 应对措施 |
|------|------|------|----------|
| 用户不愿迁移 | 高 | 中 | 提供迁移激励，简化迁移流程 |
| 数据迁移失败导致用户流失 | 高 | 低 | 充分测试，提供数据恢复机制 |
| 新版本性能不如旧版 | 中 | 低 | 性能基准测试，持续优化 |
| 开发周期延长 | 中 | 中 | 采用 MVP 策略，分阶段发布 |

### 7.4 测试策略

**测试金字塔**：
- 单元测试：70%
- 集成测试：20%
- E2E 测试：10%

**单元测试**：

```typescript
// 工具函数测试
describe('calculateBMI', () => {
  it('should calculate BMI correctly', () => {
    expect(calculateBMI(65, 170)).toBeCloseTo(22.49, 2)
  })

  it('should throw error for invalid inputs', () => {
    expect(() => calculateBMI(-1, 170)).toThrow()
    expect(() => calculateBMI(65, 0)).toThrow()
  })
})

describe('predictWeight', () => {
  it('should predict future weight based on linear regression', () => {
    const records = [
      { date: new Date('2026-03-01'), weight: 70 },
      { date: new Date('2026-03-08'), weight: 69 },
      { date: new Date('2026-03-15'), weight: 68 }
    ]
    const prediction = predictWeight(records, 7)
    expect(prediction).toBeLessThan(68)
    expect(prediction).toBeGreaterThan(66)
  })
})

// Hooks 测试
describe('useWeightRecords', () => {
  it('should add weight record', async () => {
    const { result } = renderHook(() => useWeightRecords())

    await act(async () => {
      await result.current.addRecord({
        date: new Date(),
        weight: 65.5,
        bodyFat: 18
      })
    })

    expect(result.current.records).toHaveLength(1)
    expect(result.current.records[0].weight).toBe(65.5)
  })
})

// API 服务测试
describe('WeightRecordService', () => {
  it('should sync records to server', async () => {
    const mockRecords = [
      { id: '1', weight: 65, date: new Date(), syncStatus: 'local' }
    ]

    const result = await WeightRecordService.sync(mockRecords)

    expect(result.synced).toHaveLength(1)
    expect(result.synced[0].syncStatus).toBe('synced')
  })
})
```

**集成测试**：

```typescript
// 数据同步流程测试
describe('Data Sync Integration', () => {
  it('should sync local records to server when user logs in', async () => {
    // 1. 创建本地记录（未登录状态）
    await addWeightRecord({ weight: 65, date: new Date() })

    // 2. 用户登录
    await login('13800138000', '123456')

    // 3. 自动触发同步
    await waitFor(() => {
      expect(getSyncStatus()).toBe('synced')
    })

    // 4. 验证服务器数据
    const serverRecords = await fetchWeightRecords()
    expect(serverRecords).toHaveLength(1)
  })

  it('should handle sync conflicts correctly', async () => {
    // 1. 服务器有记录 v1
    await createServerRecord({ id: '1', weight: 65, version: 1 })

    // 2. 本地修改为 v2
    await updateLocalRecord('1', { weight: 66, version: 2 })

    // 3. 服务器也修改为 v2（不同内容）
    await updateServerRecord('1', { weight: 67, version: 2 })

    // 4. 同步时检测冲突
    const result = await syncRecords()
    expect(result.conflicts).toHaveLength(1)
    expect(result.conflicts[0].reason).toBe('version_mismatch')
  })
})

// 认证流程测试
describe('Authentication Integration', () => {
  it('should complete phone login flow', async () => {
    // 1. 发送验证码
    await sendVerificationCode('13800138000')

    // 2. 验证码登录
    const result = await verifyCode('13800138000', '123456')

    expect(result.token).toBeDefined()
    expect(result.user.phone).toBe('13800138000')
  })

  it('should refresh token before expiration', async () => {
    const oldToken = await login('13800138000', '123456')

    // 模拟 token 即将过期
    jest.advanceTimersByTime(6 * 24 * 60 * 60 * 1000)

    // 自动刷新
    const newToken = await refreshToken(oldToken)
    expect(newToken).not.toBe(oldToken)
  })
})
```

**E2E 测试（Detox）**：

```typescript
// packages/mobile/e2e/record.test.ts
describe('Weight Record Flow', () => {
  beforeAll(async () => {
    await device.launchApp()
  })

  beforeEach(async () => {
    await device.reloadReactNative()
  })

  it('should add a new weight record', async () => {
    // 1. 导航到记录页面
    await element(by.id('tab-record')).tap()

    // 2. 输入体重
    await element(by.id('weight-input')).typeText('65.5')

    // 3. 输入体脂率
    await element(by.id('bodyfat-input')).typeText('18')

    // 4. 添加备注
    await element(by.id('notes-input')).typeText('晨起测量')

    // 5. 保存
    await element(by.id('save-button')).tap()

    // 6. 验证显示
    await expect(element(by.text('65.5 kg'))).toBeVisible()
    await expect(element(by.text('18%'))).toBeVisible()
  })

  it('should view history and delete record', async () => {
    // 1. 导航到历史页面
    await element(by.id('tab-history')).tap()

    // 2. 点击第一条记录
    await element(by.id('record-0')).tap()

    // 3. 点击删除按钮
    await element(by.id('delete-button')).tap()

    // 4. 确认删除
    await element(by.text('确认')).tap()

    // 5. 验证记录已删除
    await expect(element(by.id('record-0'))).not.toBeVisible()
  })

  it('should complete login and sync flow', async () => {
    // 1. 打开设置
    await element(by.id('settings-button')).tap()

    // 2. 点击登录
    await element(by.id('login-button')).tap()

    // 3. 输入手机号
    await element(by.id('phone-input')).typeText('13800138000')

    // 4. 发送验证码
    await element(by.id('send-code-button')).tap()

    // 5. 输入验证码
    await element(by.id('code-input')).typeText('123456')

    // 6. 登录
    await element(by.id('login-submit-button')).tap()

    // 7. 等待同步完成
    await waitFor(element(by.text('同步完成')))
      .toBeVisible()
      .withTimeout(5000)
  })
})
```

**性能测试**：

```typescript
// 基准测试
describe('Performance Benchmarks', () => {
  it('should load 1000 weight records in < 500ms', async () => {
    const records = generateMockRecords(1000)

    const start = performance.now()
    await loadWeightRecords(records)
    const duration = performance.now() - start

    expect(duration).toBeLessThan(500)
  })

  it('should render chart with 365 data points in < 1s', async () => {
    const records = generateMockRecords(365)

    const start = performance.now()
    render(<WeightChart data={records} />)
    const duration = performance.now() - start

    expect(duration).toBeLessThan(1000)
  })

  it('should sync 100 records in < 3s', async () => {
    const records = generateMockRecords(100)

    const start = performance.now()
    await syncWeightRecords(records)
    const duration = performance.now() - start

    expect(duration).toBeLessThan(3000)
  })
})
```

**测试覆盖率目标**：
- 整体覆盖率：> 80%
- 核心业务逻辑：> 90%
- 工具函数：100%
- UI 组件：> 70%

**测试环境**：
- 单元测试：Jest + React Testing Library
- E2E 测试：Detox（iOS/Android）
- API 测试：Supertest
- 性能测试：Lighthouse（移动端）

### 7.5 性能指标与监控

**性能基准（与现有 Cordova 版本对比）**：

| 指标 | Cordova 版本 | 目标值 | 测量方法 |
|------|-------------|--------|----------|
| 应用启动时间 | 2.5s | < 2s | Time to Interactive |
| 首屏渲染时间 | 1.8s | < 1.5s | First Contentful Paint |
| 图表渲染时间（30天数据） | 800ms | < 500ms | 自定义性能标记 |
| 添加记录响应时间 | 200ms | < 150ms | 点击到 UI 更新 |
| 历史列表滚动帧率 | 55 FPS | > 60 FPS | React DevTools Profiler |
| 内存占用（空闲） | 80MB | < 100MB | Android Profiler |
| 包体积（APK） | 15MB | < 20MB | 构建产物大小 |

**后端性能指标**：

| 指标 | 目标值 | 测量方法 |
|------|--------|----------|
| API 平均响应时间 | < 200ms | APM 工具 |
| API P95 响应时间 | < 500ms | APM 工具 |
| 数据库查询时间 | < 50ms | Prisma 日志 |
| 并发用户数 | 1000 | 负载测试 |
| 图片上传时间（1MB） | < 3s | 自定义监控 |

**监控方案**：

1. **前端监控**：
   ```typescript
   // 使用 Sentry 监控错误和性能
   Sentry.init({
     dsn: 'your-sentry-dsn',
     environment: __DEV__ ? 'development' : 'production',
     tracesSampleRate: 0.1,  // 10% 采样率
     integrations: [
       new Sentry.ReactNativeTracing({
         tracingOrigins: ['api.weight-tracker.app'],
         routingInstrumentation: new Sentry.ReactNavigationInstrumentation()
       })
     ]
   })

   // 自定义性能追踪
   const transaction = Sentry.startTransaction({
     name: 'Load Weight Records',
     op: 'data.load'
   })

   const span = transaction.startChild({
     op: 'db.query',
     description: 'Fetch records from AsyncStorage'
   })

   // ... 执行操作

   span.finish()
   transaction.finish()
   ```

2. **后端监控**：
   ```typescript
   // 使用 Winston + ELK Stack
   import winston from 'winston'

   const logger = winston.createLogger({
     level: 'info',
     format: winston.format.json(),
     transports: [
       new winston.transports.File({ filename: 'error.log', level: 'error' }),
       new winston.transports.File({ filename: 'combined.log' }),
       new winston.transports.Console({
         format: winston.format.simple()
       })
     ]
   })

   // 请求日志中间件
   app.use((req, res, next) => {
     const start = Date.now()

     res.on('finish', () => {
       const duration = Date.now() - start
       logger.info({
         method: req.method,
         path: req.path,
         status: res.statusCode,
         duration,
         userId: req.userId
       })

       // 慢查询告警
       if (duration > 1000) {
         logger.warn('Slow request detected', {
           method: req.method,
           path: req.path,
           duration
         })
       }
     })

     next()
   })
   ```

3. **数据库监控**：
   ```typescript
   // Prisma 查询日志
   const prisma = new PrismaClient({
     log: [
       { level: 'query', emit: 'event' },
       { level: 'error', emit: 'stdout' },
       { level: 'warn', emit: 'stdout' }
     ]
   })

   prisma.$on('query', (e) => {
     if (e.duration > 100) {
       logger.warn('Slow query detected', {
         query: e.query,
         duration: e.duration,
         params: e.params
       })
     }
   })
   ```

4. **告警规则**：
   - API 错误率 > 5%：立即告警
   - API P95 响应时间 > 1s：告警
   - 数据库连接池耗尽：立即告警
   - 应用崩溃率 > 1%：告警
   - 磁盘使用率 > 80%：告警

**性能优化策略**：
- 图片懒加载和虚拟滚动
- API 响应缓存（React Query）
- 数据库查询优化（索引、N+1 问题）
- CDN 加速静态资源
- 代码分割和按需加载

## 8. 总结

### 8.1 核心优势

✅ **跨平台统一** - React Native + Taro 覆盖 iOS/Android/小程序
✅ **代码复用** - 50-70% 业务逻辑共享
✅ **现代化技术栈** - TypeScript + React + Zustand
✅ **渐进式迁移** - 用户可平滑过渡，数据不丢失
✅ **可扩展架构** - Monorepo 便于维护和扩展
✅ **云端同步** - 本地优先 + 可选云备份
✅ **完整的 AI 能力** - 保留百度 AI 食物识别

### 8.2 关键决策

1. **技术栈**：选择 React Native + Taro 而非 uni-app 或 Flutter
2. **数据策略**：本地优先 + 可选云备份，而非强制云端
3. **架构模式**：Monorepo + 共享层，最大化代码复用
4. **迁移策略**：渐进式迁移，双版本并行，降低风险

### 8.3 下一步行动

1. 审核并确认本设计文档
2. 编写详细的实施计划
3. 搭建开发环境和 Monorepo 结构
4. 开始 Phase 1 开发

