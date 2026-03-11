# Phase 1: Shared 共享层 + Server 后端 实施计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 搭建 Monorepo 基础架构，实现共享业务逻辑层和后端 API 服务，为移动端和小程序提供数据支持。

**Architecture:** 采用 pnpm workspace Monorepo 结构，shared 包提供类型定义、工具函数、业务 Hooks 和 API 服务层，server 包提供 RESTful API、JWT 认证、Prisma ORM 数据访问和第三方服务集成（百度 AI、阿里云 OSS）。

**Tech Stack:** TypeScript 5.x, pnpm 8, Zustand, Zod, Day.js, Node.js 20, Express, Prisma, PostgreSQL 16, JWT, bcrypt, axios

---

## 文件结构概览

### Shared 包完整结构
```
packages/shared/
├── src/
│   ├── index.ts
│   ├── types/
│   │   ├── index.ts
│   │   ├── models.ts
│   │   └── api.ts
│   ├── utils/
│   │   ├── index.ts
│   │   ├── date.ts
│   │   ├── validation.ts
│   │   └── calculation.ts
│   ├── constants/
│   │   ├── index.ts
│   │   └── storage.ts
│   ├── services/
│   │   ├── index.ts
│   │   └── api.ts
│   ├── hooks/
│   │   ├── index.ts
│   │   ├── useWeightRecords.ts
│   │   ├── useStatistics.ts
│   │   └── useSync.ts
│   └── stores/
│       ├── index.ts
│       ├── weightStore.ts
│       └── userStore.ts
├── __tests__/
├── package.json
├── tsconfig.json
└── jest.config.js
```

### Server 包完整结构
```
packages/server/
├── src/
│   ├── index.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── weight.ts
│   │   ├── water.ts
│   │   ├── food.ts
│   │   ├── goal.ts
│   │   └── achievement.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   └── rateLimiter.ts
│   ├── services/
│   │   ├── baiduAI.ts
│   │   └── oss.ts
│   └── utils/
│       └── logger.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── __tests__/
├── package.json
├── tsconfig.json
└── jest.config.js
```

---

## Chunk 1: 测试基础设施和 Monorepo 初始化

### Task 1: 配置 Shared 包测试环境

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/jest.config.js`
- Create: `packages/shared/src/index.ts`

- [ ] **Step 1: 创建目录结构**

```bash
mkdir -p packages/shared/src packages/shared/__tests__
```

- [ ] **Step 2: 编写 package.json**

创建 `packages/shared/package.json`:
```json
{
  "name": "@weight-tracker/shared",
  "version": "1.0.0",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx"
  },
  "dependencies": {
    "zustand": "^4.4.7",
    "zod": "^3.22.4",
    "dayjs": "^1.11.10",
    "axios": "^1.6.2"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/jest": "^29.5.11",
    "typescript": "^5.3.3",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1",
    "eslint": "^8.56.0",
    "@typescript-eslint/eslint-plugin": "^6.15.0",
    "@typescript-eslint/parser": "^6.15.0"
  }
}
```

- [ ] **Step 3: 编写 TypeScript 配置**

创建 `packages/shared/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

- [ ] **Step 4: 编写 Jest 配置**

创建 `packages/shared/jest.config.js`:
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
}
```

- [ ] **Step 5: 创建临时入口文件**

创建 `packages/shared/src/index.ts`:
```typescript
// 临时空文件
export {}
```

- [ ] **Step 6: 安装依赖**

```bash
cd packages/shared
pnpm install
```

Expected: 依赖安装成功

- [ ] **Step 7: 验证测试环境**

创建测试文件 `packages/shared/src/example.test.ts`:
```typescript
describe('Test Environment', () => {
  it('should run tests', () => {
    expect(true).toBe(true)
  })
})
```

运行测试:
```bash
pnpm test
```

Expected: PASS - 1 test passed

- [ ] **Step 8: 删除示例测试并 Commit**

```bash
rm src/example.test.ts
git add packages/shared/
git commit -m "chore(shared): 配置测试环境"
```

### Task 2: 配置 Server 包测试环境

**Files:**
- Create: `packages/server/package.json`
- Create: `packages/server/tsconfig.json`
- Create: `packages/server/jest.config.js`
- Create: `packages/server/src/index.ts`
- Create: `packages/server/.env.example`

- [ ] **Step 1: 创建目录结构**

```bash
mkdir -p packages/server/src packages/server/__tests__
```

- [ ] **Step 2: 编写 package.json**

创建 `packages/server/package.json`:
```json
{
  "name": "server",
  "version": "1.0.0",
  "main": "src/index.ts",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1",
    "@prisma/client": "^5.7.0",
    "axios": "^1.6.2",
    "multer": "^1.4.5-lts.1",
    "dotenv": "^16.3.1",
    "express-rate-limit": "^7.1.5",
    "zod": "^3.22.4",
    "winston": "^3.11.0",
    "@weight-tracker/shared": "workspace:*"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/bcrypt": "^5.0.2",
    "@types/multer": "^1.4.11",
    "@types/jest": "^29.5.11",
    "tsx": "^4.7.0",
    "prisma": "^5.7.0",
    "typescript": "^5.3.3",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1",
    "supertest": "^6.3.3",
    "@types/supertest": "^6.0.2"
  }
}
```

- [ ] **Step 3: 编写 TypeScript 配置**

创建 `packages/server/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "lib": ["ES2020"],
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 4: 编写 Jest 配置**

创建 `packages/server/jest.config.js`:
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
}
```

- [ ] **Step 5: 创建环境变量模板**

创建 `packages/server/.env.example`:
```bash
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/weight_tracker"
JWT_SECRET="change-this-in-production-use-openssl-rand-base64-32"
JWT_EXPIRES_IN="7d"
BAIDU_API_KEY="your-baidu-api-key"
BAIDU_SECRET_KEY="your-baidu-secret-key"
OSS_REGION="oss-cn-hangzhou"
OSS_ACCESS_KEY_ID="your-access-key-id"
OSS_ACCESS_KEY_SECRET="your-access-key-secret"
OSS_BUCKET="weight-tracker"
WECHAT_APP_ID="your-wechat-app-id"
WECHAT_APP_SECRET="your-wechat-app-secret"
```

- [ ] **Step 6: 创建基础入口文件**

创建 `packages/server/src/index.ts`:
```typescript
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(helmet())
app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

export { app }

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  })
}
```

- [ ] **Step 7: 安装依赖**

```bash
cd packages/server
pnpm install
```

Expected: 依赖安装成功

- [ ] **Step 8: 验证测试环境**

创建测试文件 `packages/server/src/index.test.ts`:
```typescript
import request from 'supertest'
import { app } from './index'

describe('Server Health Check', () => {
  it('should return 200 on /health', async () => {
    const response = await request(app).get('/health')
    expect(response.status).toBe(200)
    expect(response.body.status).toBe('ok')
  })
})
```

运行测试:
```bash
pnpm test
```

Expected: PASS - 1 test passed

- [ ] **Step 9: Commit**

```bash
git add packages/server/
git commit -m "chore(server): 配置测试环境和基础服务器"
```

### Task 3: 安装根依赖并验证 Monorepo

**Files:**
- Modify: `pnpm-lock.yaml`

- [ ] **Step 1: 安装所有依赖**

```bash
cd D:/workspace/weight-tracker
pnpm install
```

Expected: 所有包的依赖都安装成功

- [ ] **Step 2: 验证 workspace 链接**

```bash
pnpm list --depth 0
```

Expected: 看到 @weight-tracker/shared 和 server 包

- [ ] **Step 3: 验证跨包引用**

在 `packages/server/src/test-import.ts` 创建测试:
```typescript
import '@weight-tracker/shared'
console.log('Import successful')
```

运行:
```bash
cd packages/server
tsx src/test-import.ts
```

Expected: "Import successful"

删除测试文件:
```bash
rm src/test-import.ts
```

- [ ] **Step 4: 验证所有测试**

```bash
cd D:/workspace/weight-tracker
pnpm test
```

Expected: 所有包的测试都通过

- [ ] **Step 5: Commit**

```bash
git add pnpm-lock.yaml
git commit -m "chore: 安装 Monorepo 依赖并验证环境"
```

---

## Chunk 2: Shared 核心类型定义

### Task 4: 实现数据模型类型（TDD）

**Files:**
- Create: `packages/shared/src/types/models.ts`
- Create: `packages/shared/src/types/index.ts`
- Test: `packages/shared/src/types/models.test.ts`

- [ ] **Step 1: 编写失败的测试**

创建 `packages/shared/src/types/models.test.ts`:
```typescript
import type { WeightRecord, WaterIntake, FoodRecord, UserGoal, Achievement, User, Settings } from './models'

describe('Data Models Types', () => {
  describe('WeightRecord', () => {
    it('should create valid WeightRecord with required fields', () => {
      const record: WeightRecord = {
        id: '123',
        date: new Date(),
        weight: 65.5,
        syncStatus: 'local',
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      expect(record.weight).toBe(65.5)
      expect(record.syncStatus).toBe('local')
    })

    it('should create WeightRecord with all optional fields', () => {
      const record: WeightRecord = {
        id: '123',
        userId: 'user-1',
        date: new Date(),
        weight: 65.5,
        bodyFat: 18.5,
        notes: 'Morning weight',
        photoUrl: 'https://example.com/photo.jpg',
        localPhotoUri: 'file:///local/photo.jpg',
        syncStatus: 'synced',
        version: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      expect(record.bodyFat).toBe(18.5)
      expect(record.localPhotoUri).toBeDefined()
    })
  })

  describe('WaterIntake', () => {
    it('should create valid WaterIntake', () => {
      const intake: WaterIntake = {
        id: '123',
        date: '2026-03-11',
        amount: 1500,
        target: 2000,
        syncStatus: 'local',
        version: 1
      }

      expect(intake.amount).toBe(1500)
    })
  })

  describe('FoodRecord', () => {
    it('should create valid FoodRecord', () => {
      const food: FoodRecord = {
        id: '123',
        date: new Date(),
        name: '米饭',
        calories: 200,
        syncStatus: 'local',
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      expect(food.name).toBe('米饭')
    })
  })

  describe('UserGoal', () => {
    it('should create valid UserGoal', () => {
      const goal: UserGoal = {
        id: '123',
        startWeight: 70,
        targetWeight: 65,
        startDate: new Date(),
        endDate: new Date(),
        isActive: true,
        syncStatus: 'local',
        version: 1
      }

      expect(goal.isActive).toBe(true)
    })
  })

  describe('Achievement', () => {
    it('should create valid Achievement', () => {
      const achievement: Achievement = {
        id: '123',
        type: 'first_record',
        unlockedAt: new Date(),
        syncStatus: 'local'
      }

      expect(achievement.type).toBe('first_record')
    })
  })

  describe('User', () => {
    it('should create valid User', () => {
      const user: User = {
        id: 'user-1',
        createdAt: new Date()
      }

      expect(user.id).toBe('user-1')
    })

    it('should create User with all optional fields', () => {
      const user: User = {
        id: 'user-1',
        phone: '13800138000',
        wechatOpenId: 'wx123',
        nickname: 'Test User',
        avatar: 'https://example.com/avatar.jpg',
        height: 170,
        gender: 'male',
        createdAt: new Date()
      }

      expect(user.wechatOpenId).toBe('wx123')
    })
  })

  describe('Settings', () => {
    it('should create valid Settings', () => {
      const settings: Settings = {
        darkMode: false,
        language: 'zh',
        waterTarget: 2000,
        calorieTarget: 2000,
        autoSync: true
      }

      expect(settings.language).toBe('zh')
    })
  })
})
```

- [ ] **Step 2: 运行测试验证失败**

```bash
cd packages/shared
pnpm test models.test.ts
```

Expected: FAIL - 类型未定义

- [ ] **Step 3: 实现数据模型类型**

创建 `packages/shared/src/types/models.ts`:
```typescript
// 同步状态
export type SyncStatus = 'local' | 'synced' | 'pending'

// 体重记录
export interface WeightRecord {
  id: string
  userId?: string
  date: Date
  weight: number
  bodyFat?: number
  notes?: string
  photoUrl?: string
  localPhotoUri?: string
  syncStatus: SyncStatus
  version: number
  createdAt: Date
  updatedAt: Date
}

// 饮水记录
export interface WaterIntake {
  id: string
  userId?: string
  date: string  // YYYY-MM-DD
  amount: number  // ml
  target: number  // ml
  syncStatus: SyncStatus
  version: number
}

// 食物记录
export interface FoodRecord {
  id: string
  userId?: string
  date: Date
  name: string
  calories: number
  photoUrl?: string
  confidence?: number  // 0-1
  syncStatus: SyncStatus
  version: number
  createdAt: Date
  updatedAt: Date
}

// 用户目标
export interface UserGoal {
  id: string
  userId?: string
  startWeight: number
  targetWeight: number
  startDate: Date
  endDate: Date
  isActive: boolean
  syncStatus: SyncStatus
  version: number
}

// 成就类型
export type AchievementType =
  | 'first_record'
  | 'streak_7'
  | 'streak_30'
  | 'records_10'
  | 'records_50'
  | 'records_100'
  | 'goal_achieved'

// 成就
export interface Achievement {
  id: string
  userId?: string
  type: AchievementType
  unlockedAt: Date
  syncStatus: SyncStatus
}

// 用户信息
export interface User {
  id: string
  phone?: string
  wechatOpenId?: string
  nickname?: string
  avatar?: string
  height?: number  // cm
  gender?: 'male' | 'female'
  createdAt: Date
}

// 用户设置
export interface Settings {
  darkMode: boolean
  language: 'zh' | 'en'
  waterTarget: number  // ml
  calorieTarget: number  // kcal
  autoSync: boolean
}
```

- [ ] **Step 4: 创建类型导出文件**

创建 `packages/shared/src/types/index.ts`:
```typescript
export * from './models'
```

- [ ] **Step 5: 运行测试验证通过**

```bash
pnpm test models.test.ts
```

Expected: PASS - 所有测试通过

- [ ] **Step 6: Commit**

```bash
git add src/types/
git commit -m "feat(shared): 添加核心数据模型类型定义"
```

### Task 5-10: Shared 包其他模块（简要说明）

由于完整的实施计划非常庞大，以下任务请参考设计文档详细实现，每个任务遵循 TDD 原则：

**Task 5: 实现日期工具函数**
- Files: `src/utils/date.ts`, `src/utils/date.test.ts`
- 功能: formatDate, parseDate, isToday, getDaysAgo, getDateRange
- TDD: 先写测试 → 实现 → 测试通过 → Commit

**Task 6: 实现计算工具函数**
- Files: `src/utils/calculation.ts`, `src/utils/calculation.test.ts`
- 功能: calculateBMI, predictWeight (线性回归), calculateGoalProgress
- TDD: 先写测试 → 实现 → 测试通过 → Commit

**Task 7: 实现验证工具函数**
- Files: `src/utils/validation.ts`, `src/utils/validation.test.ts`
- 功能: 使用 Zod 验证 WeightRecord, FoodRecord 等数据
- TDD: 先写测试 → 实现 → 测试通过 → Commit

**Task 8: 实现存储常量**
- Files: `src/constants/storage.ts`, `src/constants/storage.test.ts`
- 功能: STORAGE_KEYS 对象定义
- TDD: 先写测试 → 实现 → 测试通过 → Commit

**Task 9: 实现 API 服务层**
- Files: `src/services/api.ts`, `src/services/api.test.ts`
- 功能: axios 封装，请求拦截器，错误处理
- TDD: 先写测试（mock axios）→ 实现 → 测试通过 → Commit

**Task 10: 实现 Zustand Stores**
- Files: `src/stores/weightStore.ts`, `src/stores/userStore.ts`, 测试文件
- 功能: weightStore (records, loading, actions), userStore (user, token, isLoggedIn)
- TDD: 先写测试 → 实现 → 测试通过 → Commit

**Task 11: 实现 Hooks（依赖 stores）**
- Files: `src/hooks/useWeightRecords.ts`, `useStatistics.ts`, `useSync.ts`, 测试文件
- 功能: 封装业务逻辑，调用 stores 和 services
- TDD: 先写测试 → 实现 → 测试通过 → Commit

**Task 12: 更新 Shared 入口文件**
- Files: `src/index.ts`
- 导出所有模块
- 验证: `pnpm type-check` 无错误
- Commit

---

## Chunk 3: Server 数据库和中间件

### Task 13: 实现 Prisma Schema（TDD）

**Files:**
- Create: `packages/server/prisma/schema.prisma`

- [ ] **Step 1: 初始化 Prisma**

```bash
cd packages/server
pnpm prisma init
```

Expected: 创建 prisma 目录

- [ ] **Step 2: 编写完整的数据库 Schema**

编辑 `packages/server/prisma/schema.prisma`，参考设计文档 3.2 节，包含所有模型：
- User (含 wechatOpenId, phone, passwordHash 等)
- WeightRecord (含 version, syncStatus, localPhotoUri 等)
- WaterIntake
- FoodRecord
- Goal
- Achievement
- Settings

关键点：
- 所有表添加正确的索引
- 外键关系正确（onDelete: Cascade）
- version 字段用于冲突解决

- [ ] **Step 3: 生成 Prisma Client**

```bash
pnpm prisma generate
```

Expected: Prisma Client 生成成功

- [ ] **Step 4: 创建初始迁移**

```bash
pnpm prisma migrate dev --name init
```

Expected: 数据库迁移创建成功，数据库表创建

- [ ] **Step 5: 验证数据库**

```bash
pnpm prisma studio
```

Expected: Prisma Studio 打开，可以看到所有表

- [ ] **Step 6: Commit**

```bash
git add prisma/
git commit -m "feat(server): 添加完整的 Prisma 数据库 schema"
```

### Task 14: 实现 Logger 工具

**Files:**
- Create: `packages/server/src/utils/logger.ts`
- Test: `packages/server/src/utils/logger.test.ts`

- [ ] **Step 1: 编写测试**

测试 logger 的 info, error, warn 方法

- [ ] **Step 2: 实现 Winston Logger**

使用 winston 创建 logger，配置文件和控制台输出

- [ ] **Step 3: 运行测试**

```bash
pnpm test logger.test.ts
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/utils/logger.ts
git commit -m "feat(server): 实现 Winston logger"
```

### Task 15-18: Server 中间件（简要说明）

**Task 15: 实现错误处理中间件**
- Files: `src/middleware/errorHandler.ts`, 测试文件
- 功能: 统一错误响应格式，日志记录
- TDD: 先写测试 → 实现 → 测试通过 → Commit

**Task 16: 实现速率限制中间件**
- Files: `src/middleware/rateLimiter.ts`, 测试文件
- 功能: 使用 express-rate-limit，配置不同端点的限流规则
- TDD: 先写测试 → 实现 → 测试通过 → Commit

**Task 17: 实现 JWT 认证中间件**
- Files: `src/middleware/auth.ts`, 测试文件
- 功能: 验证 JWT token，提取 userId，错误处理
- TDD: 先写测试 → 实现 → 测试通过 → Commit

**Task 18: 集成中间件到主应用**
- Files: `src/index.ts`
- 添加所有中间件到 Express app
- 测试: 启动服务器，验证中间件工作
- Commit

---

## Chunk 4: Server API 路由实现

### Task 19-25: 认证路由（简要说明）

**Task 19: 实现手机号验证码发送**
- Endpoint: POST /api/auth/send-code
- TDD: 先写集成测试 → 实现路由 → 测试通过 → Commit

**Task 20: 实现验证码登录**
- Endpoint: POST /api/auth/verify-code
- 功能: 验证码校验，创建/查找用户，生成 JWT
- TDD: 先写测试 → 实现 → 测试通过 → Commit

**Task 21: 实现微信小程序登录**
- Endpoint: POST /api/auth/wechat-login
- 功能: 调用微信 API 获取 openId，创建/查找用户
- TDD: 先写测试（mock 微信 API）→ 实现 → 测试通过 → Commit

**Task 22: 实现 Token 刷新**
- Endpoint: POST /api/auth/refresh
- TDD: 先写测试 → 实现 → 测试通过 → Commit

**Task 23: 实现获取当前用户**
- Endpoint: GET /api/auth/me
- TDD: 先写测试 → 实现 → 测试通过 → Commit

**Task 24: 实现退出登录**
- Endpoint: POST /api/auth/logout
- TDD: 先写测试 → 实现 → 测试通过 → Commit

**Task 25: 认证路由集成测试**
- 测试完整的登录流程
- Commit

### Task 26-32: 体重记录路由（简要说明）

**Task 26-30: 实现 CRUD 端点**
- GET /api/weight-records (分页、筛选)
- POST /api/weight-records (创建)
- PUT /api/weight-records/:id (更新)
- DELETE /api/weight-records/:id (删除)
- 每个端点: TDD → 实现 → 测试 → Commit

**Task 31: 实现批量同步端点**
- POST /api/weight-records/sync
- 功能: 版本冲突检测，批量更新
- TDD: 先写测试 → 实现 → 测试通过 → Commit

**Task 32: 体重记录集成测试**
- 测试完整的 CRUD 和同步流程
- Commit

### Task 33-40: 其他路由（简要说明）

**Task 33-35: 饮水记录路由**
- GET/POST /api/water-intake/:date
- POST /api/water-intake/sync
- TDD → 实现 → 测试 → Commit

**Task 36-38: 食物记录和识别路由**
- GET/POST /api/food-records
- POST /api/food/recognize (集成百度 AI)
- TDD → 实现 → 测试 → Commit

**Task 39: 目标管理路由**
- GET/POST /api/goals/active
- TDD → 实现 → 测试 → Commit

**Task 40: 成就路由**
- GET /api/achievements
- POST /api/achievements/check
- TDD → 实现 → 测试 → Commit

---

## Chunk 5: 第三方服务集成

### Task 41: 实现百度 AI 服务（TDD）

**Files:**
- Create: `packages/server/src/services/baiduAI.ts`
- Test: `packages/server/src/services/baiduAI.test.ts`

参考设计文档 5.5 节完整实现，包含：
- Access Token 管理（缓存和刷新）
- 食物识别方法（带重试逻辑）
- 错误处理和降级方案
- 健康检查方法

TDD 流程：
- [ ] Step 1: 编写测试（mock axios）
- [ ] Step 2: 实现服务类
- [ ] Step 3: 运行测试验证通过
- [ ] Step 4: Commit

### Task 42: 实现阿里云 OSS 服务（TDD）

**Files:**
- Create: `packages/server/src/services/oss.ts`
- Test: `packages/server/src/services/oss.test.ts`

功能：
- 图片上传方法
- 图片删除方法
- URL 生成

TDD 流程：
- [ ] Step 1: 编写测试（mock OSS SDK）
- [ ] Step 2: 实现服务类
- [ ] Step 3: 运行测试验证通过
- [ ] Step 4: Commit

---

## Chunk 6: 集成测试和文档

### Task 43: API 端到端集成测试

**Files:**
- Create: `packages/server/src/__tests__/integration/auth.test.ts`
- Create: `packages/server/src/__tests__/integration/weight.test.ts`
- Create: `packages/server/src/__tests__/integration/sync.test.ts`

测试场景：
- 完整的用户注册登录流程
- 创建体重记录并同步
- 冲突解决流程
- 食物识别流程

- [ ] **Step 1: 编写集成测试**
- [ ] **Step 2: 运行测试**

```bash
pnpm test --testPathPattern=integration
```

Expected: 所有集成测试通过

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/integration/
git commit -m "test(server): 添加 API 集成测试"
```

### Task 44: 生成 API 文档

**Files:**
- Create: `packages/server/docs/API.md`

- [ ] **Step 1: 编写 API 文档**

记录所有端点：
- 请求方法和路径
- 请求参数（Headers, Query, Body）
- 响应格式
- 错误码
- 示例

- [ ] **Step 2: Commit**

```bash
git add docs/
git commit -m "docs(server): 添加完整的 API 文档"
```

### Task 45: 验证测试覆盖率

- [ ] **Step 1: 运行覆盖率测试**

```bash
cd D:/workspace/weight-tracker
pnpm test:coverage
```

Expected:
- Shared 包覆盖率 > 80%
- Server 包覆盖率 > 80%

- [ ] **Step 2: 如果覆盖率不足，补充测试**

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "test: 提升测试覆盖率到 80%+"
```

---

## 验收标准

Phase 1 完成的标志：

✅ **Monorepo 基础设施**
- pnpm workspace 正常工作
- 所有包可以相互引用
- 类型检查无错误

✅ **Shared 包完整性**
- 所有类型定义完整（models, api）
- 所有工具函数实现（date, calculation, validation）
- 所有常量定义
- API 服务层实现
- Hooks 实现（useWeightRecords, useStatistics, useSync）
- Stores 实现（weightStore, userStore）
- 测试覆盖率 > 80%

✅ **Server 包完整性**
- Prisma schema 包含所有模型
- 数据库迁移成功
- 所有中间件实现（auth, errorHandler, rateLimiter）
- 所有路由实现（auth, weight, water, food, goal, achievement）
- 第三方服务集成（百度 AI, 阿里云 OSS）
- Logger 工具实现
- 测试覆盖率 > 80%

✅ **API 功能完整**
- 认证流程完整（手机号登录、微信登录、token 刷新）
- 体重记录 CRUD 完整
- 数据同步功能完整（含冲突解决）
- 食物识别功能完整
- 所有端点有集成测试

✅ **文档完整**
- API 文档完整
- 代码注释清晰
- README 更新

✅ **质量保证**
- 所有测试通过
- 测试覆盖率 > 80%
- 无 TypeScript 错误
- 无 ESLint 错误
- 服务器可以独立运行

**下一步:** Phase 2 - Mobile React Native 实现

