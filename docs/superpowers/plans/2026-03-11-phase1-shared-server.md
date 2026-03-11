# Phase 1: Shared 共享层 + Server 后端 实施计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 搭建 Monorepo 基础架构，实现共享业务逻辑层和后端 API 服务，为移动端和小程序提供数据支持。

**Architecture:** 采用 pnpm workspace Monorepo 结构，shared 包提供类型定义、工具函数、业务 Hooks 和 API 服务层，server 包提供 RESTful API、JWT 认证、Prisma ORM 数据访问和第三方服务集成（百度 AI、阿里云 OSS）。

**Tech Stack:** TypeScript 5.x, pnpm 8, Zustand, Zod, Day.js, Node.js 20, Express, Prisma, PostgreSQL 16, JWT, bcrypt, axios

---

## 文件结构概览

### Shared 包结构
```
packages/shared/
├── src/
│   ├── index.ts                    # 主入口
│   ├── types/
│   │   ├── index.ts
│   │   ├── models.ts               # 数据模型类型
│   │   └── api.ts                  # API 请求/响应类型
│   ├── utils/
│   │   ├── index.ts
│   │   ├── date.ts                 # 日期工具
│   │   ├── validation.ts           # 数据验证
│   │   └── calculation.ts          # BMI、趋势预测等计算
│   ├── constants/
│   │   ├── index.ts
│   │   └── storage.ts              # 存储键常量
│   ├── services/
│   │   ├── index.ts
│   │   └── api.ts                  # API 调用封装
│   ├── hooks/
│   │   ├── index.ts
│   │   ├── useWeightRecords.ts     # 体重记录管理
│   │   ├── useStatistics.ts        # 统计计算
│   │   └── useSync.ts              # 数据同步
│   └── stores/
│       ├── index.ts
│       ├── weightStore.ts          # 体重数据 store
│       └── userStore.ts            # 用户状态 store
├── package.json
└── tsconfig.json
```

### Server 包结构
```
packages/server/
├── src/
│   ├── index.ts                    # 主入口
│   ├── routes/
│   │   ├── auth.ts                 # 认证路由
│   │   ├── weight.ts               # 体重记录路由
│   │   └── food.ts                 # 食物识别路由
│   ├── middleware/
│   │   ├── auth.ts                 # JWT 验证中间件
│   │   ├── errorHandler.ts        # 错误处理
│   │   └── rateLimiter.ts          # 速率限制
│   ├── services/
│   │   ├── baiduAI.ts              # 百度 AI 服务
│   │   └── oss.ts                  # 阿里云 OSS 服务
│   └── utils/
│       └── logger.ts               # 日志工具
├── prisma/
│   └── schema.prisma               # 数据库 schema
├── package.json
├── tsconfig.json
└── .env.example
```

---

## Chunk 1: Monorepo 基础架构

### Task 1: 初始化 Shared 包

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`

- [ ] **Step 1: 创建 shared 包目录**

```bash
mkdir -p packages/shared/src
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
    "type-check": "tsc --noEmit",
    "test": "jest",
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
    "typescript": "^5.3.3",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.11",
    "ts-jest": "^29.1.1",
    "eslint": "^8.56.0"
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

- [ ] **Step 4: 创建临时入口文件**

创建 `packages/shared/src/index.ts`:
```typescript
// 临时空文件，后续会添加导出
export {}
```

- [ ] **Step 5: 安装依赖**

```bash
cd packages/shared
pnpm install
```

Expected: 依赖安装成功

- [ ] **Step 6: 验证类型检查**

```bash
pnpm type-check
```

Expected: 无错误

- [ ] **Step 7: Commit**

```bash
git add packages/shared/
git commit -m "chore: 初始化 shared 包配置"
```

### Task 2: 初始化 Server 包

**Files:**
- Create: `packages/server/package.json`
- Create: `packages/server/tsconfig.json`
- Create: `packages/server/src/index.ts`
- Create: `packages/server/.env.example`

- [ ] **Step 1: 创建 server 包目录**

```bash
mkdir -p packages/server/src
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
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "test": "jest",
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
    "@weight-tracker/shared": "workspace:*"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/bcrypt": "^5.0.2",
    "@types/multer": "^1.4.11",
    "tsx": "^4.7.0",
    "prisma": "^5.7.0",
    "typescript": "^5.3.3"
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

- [ ] **Step 4: 创建环境变量模板**

创建 `packages/server/.env.example`:
```bash
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/weight_tracker"
JWT_SECRET="change-this-in-production"
JWT_EXPIRES_IN="7d"
```

- [ ] **Step 5: 创建基础入口文件**

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

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
```

- [ ] **Step 6: 安装依赖**

```bash
cd packages/server
pnpm install
```

Expected: 依赖安装成功

- [ ] **Step 7: 测试服务器启动**

```bash
cp .env.example .env
pnpm dev
```

Expected: 看到 "🚀 Server running on http://localhost:3001"

访问 http://localhost:3001/health 应该返回 JSON

- [ ] **Step 8: 停止服务器并 Commit**

按 Ctrl+C 停止服务器

```bash
git add packages/server/
git commit -m "chore: 初始化 server 包配置"
```

### Task 3: 安装根依赖并验证 Monorepo

**Files:**
- Modify: `pnpm-lock.yaml` (根目录)

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

- [ ] **Step 3: 验证类型检查**

```bash
pnpm type-check
```

Expected: shared 和 server 都无类型错误

- [ ] **Step 4: Commit**

```bash
git add pnpm-lock.yaml
git commit -m "chore: 安装 Monorepo 依赖"
```

---

## Chunk 2: Shared 核心类型和工具

由于实施计划内容庞大，完整的任务列表请参考设计文档。以下是关键里程碑任务：

### Task 4-10: Shared 包核心实现

**关键文件:**
- `packages/shared/src/types/models.ts` - 数据模型类型
- `packages/shared/src/utils/date.ts` - 日期工具
- `packages/shared/src/utils/calculation.ts` - BMI、趋势预测
- `packages/shared/src/constants/storage.ts` - 存储键常量
- `packages/shared/src/services/api.ts` - API 调用封装

**实施要点:**
- 遵循 TDD：先写测试，再实现
- 每个工具函数都要有单元测试
- 使用 Zod 进行运行时类型验证
- 每完成一个模块就 commit

---

## Chunk 3: Server 数据库和认证

### Task 11: 初始化 Prisma 和数据库 Schema

**Files:**
- Create: `packages/server/prisma/schema.prisma`

- [ ] **Step 1: 初始化 Prisma**

```bash
cd packages/server
pnpm prisma init
```

Expected: 创建 prisma 目录和 schema.prisma

- [ ] **Step 2: 编写数据库 Schema**

编辑 `packages/server/prisma/schema.prisma`，添加完整的数据库模型（参考设计文档 3.2 节）

关键模型：User, WeightRecord, WaterIntake, FoodRecord, Goal, Achievement, Settings

- [ ] **Step 3: 生成 Prisma Client**

```bash
pnpm prisma generate
```

Expected: Prisma Client 生成成功

- [ ] **Step 4: 创建数据库迁移**

```bash
pnpm prisma migrate dev --name init
```

Expected: 数据库迁移创建成功

- [ ] **Step 5: 验证数据库连接**

```bash
pnpm prisma studio
```

Expected: Prisma Studio 在浏览器中打开

- [ ] **Step 6: Commit**

```bash
git add prisma/
git commit -m "feat(server): 添加 Prisma 数据库 schema"
```

### Task 12: 实现 JWT 认证中间件

**Files:**
- Create: `packages/server/src/middleware/auth.ts`
- Test: `packages/server/src/middleware/auth.test.ts`

- [ ] **Step 1: 编写测试**

创建测试文件验证 JWT 验证逻辑

- [ ] **Step 2: 实现认证中间件**

实现 JWT token 验证、用户信息提取、错误处理

- [ ] **Step 3: 运行测试**

```bash
pnpm test auth.test.ts
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/middleware/auth.ts
git commit -m "feat(server): 实现 JWT 认证中间件"
```

### Task 13-15: 实现认证路由

**关键文件:**
- `packages/server/src/routes/auth.ts` - 认证路由
- 实现手机号验证码登录
- 实现微信小程序登录
- 实现 token 刷新

---

## Chunk 4: Server API 路由实现

### Task 16-20: 体重记录 API

**关键文件:**
- `packages/server/src/routes/weight.ts`

**实现接口:**
- GET /api/weight-records - 获取记录列表
- POST /api/weight-records - 创建记录
- PUT /api/weight-records/:id - 更新记录
- DELETE /api/weight-records/:id - 删除记录
- POST /api/weight-records/sync - 批量同步

### Task 21-25: 百度 AI 食物识别集成

**关键文件:**
- `packages/server/src/services/baiduAI.ts`
- `packages/server/src/routes/food.ts`

**实现功能:**
- Access Token 管理（缓存和刷新）
- 食物识别 API 调用
- 错误处理和重试逻辑
- 降级方案（手动输入）

---

## Chunk 5: 集成测试和文档

### Task 26: API 集成测试

**Files:**
- Create: `packages/server/src/__tests__/integration/`

- [ ] **Step 1: 编写认证流程集成测试**

测试完整的登录、token 刷新、退出流程

- [ ] **Step 2: 编写数据同步集成测试**

测试本地记录同步到服务器、冲突解决

- [ ] **Step 3: 运行所有测试**

```bash
cd packages/server
pnpm test
```

Expected: 所有测试通过

- [ ] **Step 4: Commit**

```bash
git add src/__tests__/
git commit -m "test(server): 添加 API 集成测试"
```

### Task 27: 生成 API 文档

**Files:**
- Create: `packages/server/docs/API.md`

- [ ] **Step 1: 编写 API 文档**

记录所有 API 端点、请求/响应格式、错误码

- [ ] **Step 2: Commit**

```bash
git add docs/
git commit -m "docs(server): 添加 API 文档"
```

---

## 验收标准

Phase 1 完成的标志：

✅ Monorepo 结构搭建完成，pnpm workspace 正常工作
✅ Shared 包提供完整的类型定义、工具函数、API 服务层
✅ Server 提供完整的 RESTful API，包括认证、体重记录、食物识别
✅ 数据库 schema 完整，支持所有数据模型
✅ 单元测试覆盖率 > 80%
✅ 集成测试覆盖关键业务流程
✅ API 文档完整
✅ 服务器可以独立运行并通过健康检查

**下一步:** Phase 2 - Mobile React Native 实现

