# Phase 4: 数据迁移和发布准备实施计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现从旧版 Cordova 应用到新版的数据迁移工具，配置 CI/CD 流水线，完成应用商店和小程序发布准备，确保平滑上线。

**Architecture:** 数据迁移工具（导出/导入/转换/验证），CI/CD 自动化（GitHub Actions），部署脚本（Docker + Nginx），应用签名和发布配置。

**Tech Stack:** Node.js 脚本, Docker, Nginx, GitHub Actions, Android Gradle, Xcode, 微信开发者工具

**Prerequisites:** Phase 1-3 必须完成（所有功能开发完成并测试通过）

---

## Phase 4 范围说明

**Part A: 数据迁移**
- ✅ 旧版数据导出工具
- ✅ 数据格式转换和验证
- ✅ 新版数据导入工具
- ✅ 迁移测试和回滚机制

**Part B: CI/CD 配置**
- ✅ GitHub Actions 工作流
- ✅ 自动化测试和构建
- ✅ 自动化部署

**Part C: 发布准备**
- ✅ Android 签名和打包
- ✅ iOS 签名和打包
- ✅ 小程序审核准备
- ✅ 服务器部署配置

**Part D: 监控和文档**
- ✅ 错误监控（Sentry）
- ✅ 性能监控
- ✅ 用户文档和迁移指南

---

## 文件结构概览

```
weight-tracker/
├── scripts/
│   ├── migration/
│   │   ├── export-legacy.js       # 导出旧版数据
│   │   ├── transform.js           # 数据转换
│   │   ├── validate.js            # 数据验证
│   │   └── import-new.js          # 导入新版
│   ├── deploy/
│   │   ├── deploy-server.sh       # 服务器部署
│   │   └── rollback.sh            # 回滚脚本
│   └── build/
│       ├── build-android.sh       # Android 构建
│       └── build-ios.sh           # iOS 构建
├── .github/
│   └── workflows/
│       ├── ci.yml                 # CI 流水线
│       ├── deploy-server.yml      # 服务器部署
│       └── build-mobile.yml       # 移动端构建
├── docker/
│   ├── docker-compose.yml
│   ├── nginx.conf
│   └── Dockerfile
├── docs/
│   ├── MIGRATION_GUIDE.md         # 迁移指南
│   ├── DEPLOYMENT.md              # 部署文档
│   └── USER_GUIDE.md              # 用户手册
└── packages/server/
    └── src/
        └── routes/
            └── migration.ts       # 迁移 API 端点
```

---

## Chunk 1: 数据迁移工具开发

### Task 1: 实现旧版数据导出工具

**Files:**
- Create: `scripts/migration/export-legacy.js`
- Create: `scripts/migration/export-legacy.test.js`

- [ ] **Step 1: 编写测试**

测试从 localStorage 读取旧版数据并导出为 JSON

- [ ] **Step 2: 实现导出脚本**

```javascript
// 读取旧版 Cordova 应用的 localStorage 数据
// 导出为 JSON 文件
const fs = require('fs')

function exportLegacyData() {
  const data = {
    weightRecords: JSON.parse(localStorage.getItem('weight_records') || '[]'),
    waterIntake: JSON.parse(localStorage.getItem('water_intake') || '{}'),
    foodRecords: JSON.parse(localStorage.getItem('food_records') || '[]'),
    userGoal: JSON.parse(localStorage.getItem('user_goal') || 'null'),
    achievements: JSON.parse(localStorage.getItem('achievements') || '{}'),
    settings: JSON.parse(localStorage.getItem('settings') || '{}'),
    exportDate: new Date().toISOString(),
    version: '1.0.0'
  }

  const filename = `weight-tracker-backup-${Date.now()}.json`
  fs.writeFileSync(filename, JSON.stringify(data, null, 2))

  return { filename, recordCount: data.weightRecords.length }
}

module.exports = { exportLegacyData }
```

- [ ] **Step 3: 运行测试**

```bash
node scripts/migration/export-legacy.test.js
```

Expected: PASS

- [ ] **Step 4: 添加 CLI 接口**

```bash
node scripts/migration/export-legacy.js --output backup.json
```

- [ ] **Step 5: Commit**

```bash
git add scripts/migration/export-legacy.js
git commit -m "feat(migration): 实现旧版数据导出工具"
```

### Task 2: 实现数据转换和验证

**Files:**
- Create: `scripts/migration/transform.js`
- Create: `scripts/migration/validate.js`
- Test: `scripts/migration/transform.test.js`

- [ ] **Step 1: 编写测试**

测试数据格式转换和验证逻辑

- [ ] **Step 2: 实现转换脚本**

参考设计文档 7.1 节的完整转换逻辑：
- 转换体重记录（添加 id, version, syncStatus）
- 转换饮水记录
- 转换食物记录
- 转换目标和成就
- 错误处理和日志记录

- [ ] **Step 3: 实现验证脚本**

```javascript
function validateMigratedData(data) {
  const errors = []

  // 验证体重记录
  data.weightRecords.forEach((record, index) => {
    if (!record.id || !record.date || !record.weight) {
      errors.push(`Record ${index}: missing required fields`)
    }
    if (record.weight < 20 || record.weight > 300) {
      errors.push(`Record ${index}: invalid weight ${record.weight}`)
    }
  })

  // 验证其他数据...

  return { valid: errors.length === 0, errors }
}
```

- [ ] **Step 4: 运行测试**

```bash
node scripts/migration/transform.test.js
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add scripts/migration/transform.js scripts/migration/validate.js
git commit -m "feat(migration): 实现数据转换和验证"
```

### Task 3: 实现新版数据导入工具

**Files:**
- Create: `scripts/migration/import-new.js`
- Create: `packages/mobile/src/utils/migration.ts`
- Test: 测试文件

- [ ] **Step 1: 编写测试**

测试导入流程和错误处理

- [ ] **Step 2: 实现移动端导入工具**

```typescript
// packages/mobile/src/utils/migration.ts
import AsyncStorage from '@react-native-async-storage/async-storage'
import { DataMigration } from '@weight-tracker/shared'

export async function importLegacyData(jsonData: string) {
  try {
    const legacyData = JSON.parse(jsonData)
    const transformed = DataMigration.transformToNewFormat(legacyData)
    const validation = DataMigration.validateMigratedData(transformed)

    if (!validation.valid) {
      return { success: false, errors: validation.errors }
    }

    await DataMigration.importToNewSystem(transformed)

    return {
      success: true,
      stats: {
        weightRecords: transformed.weightRecords.length,
        waterIntakes: transformed.waterIntakes.length,
        foodRecords: transformed.foodRecords.length
      }
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

- [ ] **Step 3: 实现迁移 UI**

在移动端添加"导入数据"页面

- [ ] **Step 4: 运行测试**

```bash
pnpm test migration.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add scripts/migration/import-new.js packages/mobile/src/utils/migration.ts
git commit -m "feat(migration): 实现新版数据导入工具"
```

### Task 4: 实现迁移回滚机制

**Files:**
- Create: `scripts/migration/rollback.js`

- [ ] **Step 1: 实现备份功能**

在导入前自动创建当前数据备份

- [ ] **Step 2: 实现回滚功能**

```javascript
async function rollbackMigration(backupFile) {
  // 恢复备份数据
  // 清除迁移标记
  // 验证回滚成功
}
```

- [ ] **Step 3: 测试回滚**

- [ ] **Step 4: Commit**

```bash
git add scripts/migration/rollback.js
git commit -m "feat(migration): 实现迁移回滚机制"
```

---

## Chunk 2: CI/CD 配置

### Task 5: 配置 GitHub Actions CI 流水线

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: 创建 CI 配置**

参考设计文档 6.4 节的完整 GitHub Actions 配置：
- Lint 和类型检查
- 单元测试和集成测试
- 代码覆盖率上传

- [ ] **Step 2: 测试 CI 流水线**

提交代码触发 CI，验证所有步骤通过

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: 配置 GitHub Actions CI 流水线"
```

### Task 6: 配置自动化部署

**Files:**
- Create: `.github/workflows/deploy-server.yml`
- Create: `scripts/deploy/deploy-server.sh`

- [ ] **Step 1: 创建部署工作流**

```yaml
name: Deploy Server

on:
  push:
    branches: [main]
    paths:
      - 'packages/server/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker image
        run: docker build -t weight-tracker-server packages/server
      - name: Deploy to production
        run: ./scripts/deploy/deploy-server.sh
```

- [ ] **Step 2: 实现部署脚本**

```bash
#!/bin/bash
# SSH 到生产服务器
# 拉取最新镜像
# 重启服务
# 运行数据库迁移
# 健康检查
```

- [ ] **Step 3: 测试部署**

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/deploy-server.yml scripts/deploy/
git commit -m "ci: 配置自动化部署流水线"
```

### Task 7: 配置移动端构建流水线

**Files:**
- Create: `.github/workflows/build-mobile.yml`
- Create: `scripts/build/build-android.sh`
- Create: `scripts/build/build-ios.sh`

- [ ] **Step 1: 创建构建工作流**

自动构建 Android APK 和 iOS IPA

- [ ] **Step 2: 配置签名密钥**

使用 GitHub Secrets 存储签名密钥

- [ ] **Step 3: 测试构建**

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/build-mobile.yml scripts/build/
git commit -m "ci: 配置移动端构建流水线"
```

---

## Chunk 3: 服务器部署配置

### Task 8: 配置 Docker 和 Nginx

**Files:**
- Create: `docker/docker-compose.yml`
- Create: `docker/nginx.conf`
- Create: `packages/server/Dockerfile`

- [ ] **Step 1: 创建 Docker Compose 配置**

参考设计文档 6.5 节：
- PostgreSQL 服务
- Server 服务
- Nginx 反向代理

- [ ] **Step 2: 创建 Nginx 配置**

```nginx
upstream api_server {
    server server:3001;
}

server {
    listen 80;
    server_name api.weight-tracker.app;

    location / {
        proxy_pass http://api_server;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

- [ ] **Step 3: 测试 Docker 部署**

```bash
docker-compose up -d
```

Expected: 所有服务正常启动

- [ ] **Step 4: Commit**

```bash
git add docker/
git commit -m "feat(deploy): 配置 Docker 和 Nginx"
```

### Task 9: 配置 HTTPS 和域名

**Files:**
- Modify: `docker/nginx.conf`
- Create: `scripts/deploy/setup-ssl.sh`

- [ ] **Step 1: 配置 Let's Encrypt**

使用 Certbot 自动获取 SSL 证书

- [ ] **Step 2: 更新 Nginx 配置**

添加 HTTPS 监听和证书配置

- [ ] **Step 3: 测试 HTTPS**

访问 https://api.weight-tracker.app

- [ ] **Step 4: Commit**

```bash
git add docker/nginx.conf scripts/deploy/setup-ssl.sh
git commit -m "feat(deploy): 配置 HTTPS 和 SSL 证书"
```

---

## Chunk 4: 移动端发布准备

### Task 10: Android 签名和打包

**Files:**
- Create: `packages/mobile/android/app/build.gradle` (修改)
- Create: `packages/mobile/android/keystore.properties`

- [ ] **Step 1: 生成签名密钥**

```bash
keytool -genkey -v -keystore release.keystore \
  -alias weight-tracker \
  -keyalg RSA -keysize 2048 -validity 10000
```

- [ ] **Step 2: 配置 Gradle 签名**

编辑 `android/app/build.gradle`，添加签名配置

- [ ] **Step 3: 构建发布版本**

```bash
cd packages/mobile/android
./gradlew assembleRelease
```

Expected: 生成 app-release.apk

- [ ] **Step 4: 测试 APK**

安装到真机测试

- [ ] **Step 5: Commit**

```bash
git add android/app/build.gradle
git commit -m "feat(mobile): 配置 Android 签名和发布构建"
```

### Task 11: iOS 签名和打包

**Files:**
- Modify: `packages/mobile/ios/mobile.xcodeproj`

- [ ] **Step 1: 配置 Apple Developer 账号**

在 Xcode 中添加开发者账号和证书

- [ ] **Step 2: 配置 Bundle ID 和版本**

- [ ] **Step 3: 构建 Archive**

```bash
xcodebuild -workspace mobile.xcworkspace \
  -scheme mobile \
  -configuration Release \
  -archivePath build/mobile.xcarchive \
  archive
```

- [ ] **Step 4: 导出 IPA**

- [ ] **Step 5: 测试 IPA**

使用 TestFlight 分发测试

- [ ] **Step 6: Commit**

```bash
git add ios/
git commit -m "feat(mobile): 配置 iOS 签名和发布构建"
```

### Task 12: 小程序审核准备

**Files:**
- Create: `packages/miniapp/project.config.json`
- Create: `docs/MINIAPP_SUBMISSION.md`

- [ ] **Step 1: 配置小程序信息**

appid, 版本号, 描述等

- [ ] **Step 2: 准备审核资料**

- 应用截图（5张）
- 功能说明
- 隐私政策
- 用户协议

- [ ] **Step 3: 构建小程序**

```bash
cd packages/miniapp
pnpm build:weapp
```

- [ ] **Step 4: 使用开发者工具上传**

- [ ] **Step 5: 提交审核**

- [ ] **Step 6: Commit**

```bash
git add packages/miniapp/project.config.json docs/MINIAPP_SUBMISSION.md
git commit -m "feat(miniapp): 准备小程序审核资料"
```

---

## Chunk 5: 监控和文档

### Task 13: 配置错误监控

**Files:**
- Modify: `packages/mobile/src/App.tsx`
- Modify: `packages/server/src/index.ts`

- [ ] **Step 1: 安装 Sentry**

```bash
pnpm add @sentry/react-native @sentry/node
```

- [ ] **Step 2: 配置移动端 Sentry**

```typescript
import * as Sentry from '@sentry/react-native'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: __DEV__ ? 'development' : 'production'
})
```

- [ ] **Step 3: 配置服务端 Sentry**

- [ ] **Step 4: 测试错误上报**

- [ ] **Step 5: Commit**

```bash
git add packages/mobile/src/App.tsx packages/server/src/index.ts
git commit -m "feat(monitoring): 配置 Sentry 错误监控"
```

### Task 14: 编写用户文档

**Files:**
- Create: `docs/MIGRATION_GUIDE.md`
- Create: `docs/USER_GUIDE.md`
- Create: `docs/FAQ.md`

- [ ] **Step 1: 编写迁移指南**

详细说明如何从旧版迁移到新版：
- 导出旧版数据步骤
- 安装新版应用
- 导入数据步骤
- 常见问题解决

- [ ] **Step 2: 编写用户手册**

新版应用的功能说明和使用教程

- [ ] **Step 3: 编写 FAQ**

常见问题和解答

- [ ] **Step 4: Commit**

```bash
git add docs/
git commit -m "docs: 添加用户文档和迁移指南"
```

### Task 15: 编写部署文档

**Files:**
- Create: `docs/DEPLOYMENT.md`
- Create: `docs/ROLLBACK.md`

- [ ] **Step 1: 编写部署文档**

详细的生产环境部署步骤

- [ ] **Step 2: 编写回滚文档**

紧急回滚步骤和注意事项

- [ ] **Step 3: Commit**

```bash
git add docs/DEPLOYMENT.md docs/ROLLBACK.md
git commit -m "docs: 添加部署和回滚文档"
```

---

## Chunk 6: 最终验收和发布

### Task 16: 全面测试

- [ ] **Step 1: 运行所有自动化测试**

```bash
pnpm test
pnpm test:e2e
```

Expected: 所有测试通过

- [ ] **Step 2: 手动测试关键流程**

- 数据迁移流程
- 新用户注册流程
- 所有核心功能
- 跨平台兼容性

- [ ] **Step 3: 性能测试**

验证性能指标符合要求

- [ ] **Step 4: 安全测试**

检查 API 安全性、数据加密

- [ ] **Step 5: 记录测试结果**

### Task 17: 灰度发布

- [ ] **Step 1: 发布到小范围用户**

选择 10-20 个测试用户

- [ ] **Step 2: 收集反馈**

监控错误日志和用户反馈

- [ ] **Step 3: 修复问题**

快速迭代修复发现的问题

- [ ] **Step 4: 扩大发布范围**

逐步增加用户数量

### Task 18: 正式发布

- [ ] **Step 1: 发布到应用商店**

- Google Play Store
- Apple App Store

- [ ] **Step 2: 发布小程序**

微信小程序正式上线

- [ ] **Step 3: 部署生产服务器**

```bash
./scripts/deploy/deploy-server.sh production
```

- [ ] **Step 4: 监控上线状态**

实时监控错误率、性能指标

- [ ] **Step 5: 发布公告**

通知用户新版本上线

---

## 验收标准

Phase 4 完成的标志：

✅ 数据迁移工具完整且经过充分测试
✅ 迁移成功率 > 99%
✅ CI/CD 流水线正常工作
✅ 服务器部署成功，HTTPS 配置正确
✅ Android APK 签名并发布到 Google Play
✅ iOS IPA 签名并发布到 App Store
✅ 小程序通过审核并上线
✅ Sentry 错误监控正常工作
✅ 所有文档完整（用户文档、部署文档、迁移指南）
✅ 灰度发布顺利，无重大问题
✅ 正式发布成功，用户反馈良好

**项目完成！** 🎉

所有 4 个 Phase 全部完成，体重管理 App 重构项目成功上线。

