# Phase 3: 高级功能实施计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现移动端和小程序的高级功能，包括洞察分析、AI 食物识别、成就系统和照片管理，完善用户体验。

**Architecture:** 在 Phase 2 基础上扩展，添加洞察页面（BMI 分析、趋势预测）、饮食页面（AI 识别、卡路里追踪）、成就系统和照片上传功能。同时开始 Taro 小程序开发。

**Tech Stack:**
- Mobile: React Native Image Picker, React Native Image Resizer
- Miniapp: Taro 3.6+, Taro UI, ECharts for Taro
- Shared: 已有的 hooks 和 services

**Prerequisites:** Phase 2 必须完成（核心 3 个 Tab 功能正常）

---

## Phase 3 范围说明

**Part A: Mobile 高级功能**
- ✅ 洞察页面（BMI 分析、趋势预测、照片对比、健康建议）
- ✅ 饮食页面（AI 食物识别、手动输入、卡路里追踪）
- ✅ 成就系统（12 种徽章、解锁动画）
- ✅ 照片功能（拍照、相册选择、压缩、上传）

**Part B: Taro 小程序开发**
- ✅ 小程序项目初始化
- ✅ 5 个主 Tab 页面（复用 Shared 逻辑）
- ✅ 平台适配（Taro API 封装）
- ✅ 微信授权登录

---

## 文件结构概览

### Mobile 新增文件
```
packages/mobile/src/
├── screens/
│   ├── InsightsScreen.tsx      # 洞察页面
│   ├── FoodScreen.tsx          # 饮食页面
│   └── AchievementsScreen.tsx  # 成就列表页面
├── components/
│   ├── BMIGauge.tsx            # BMI 量表组件
│   ├── TrendChart.tsx          # 趋势预测图表
│   ├── PhotoComparison.tsx     # 照片对比组件
│   ├── FoodRecognition.tsx     # 食物识别组件
│   └── AchievementBadge.tsx    # 成就徽章组件
└── services/
    └── imageService.ts         # 图片处理服务
```

### Miniapp 结构
```
packages/miniapp/
├── src/
│   ├── app.config.ts
│   ├── app.tsx
│   ├── pages/
│   │   ├── record/index.tsx
│   │   ├── history/index.tsx
│   │   ├── statistics/index.tsx
│   │   ├── insights/index.tsx
│   │   └── food/index.tsx
│   ├── components/
│   ├── adapters/
│   │   └── platformAdapter.ts  # Taro 平台适配
│   └── utils/
├── package.json
├── tsconfig.json
└── project.config.json
```

---

## Chunk 1: Mobile 照片功能基础

### Task 1: 安装照片相关依赖

**Files:**
- Modify: `packages/mobile/package.json`

- [ ] **Step 1: 安装依赖**

```bash
cd packages/mobile
pnpm add react-native-image-picker react-native-image-resizer
```

- [ ] **Step 2: 配置 iOS 权限**

编辑 `ios/mobile/Info.plist`，添加：
```xml
<key>NSCameraUsageDescription</key>
<string>需要访问相机以拍摄体重记录照片</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>需要访问相册以选择照片</string>
```

- [ ] **Step 3: 配置 Android 权限**

编辑 `android/app/src/main/AndroidManifest.xml`，添加：
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

- [ ] **Step 4: 链接原生模块**

```bash
cd ios && pod install && cd ..
```

- [ ] **Step 5: Commit**

```bash
git add package.json ios/ android/
git commit -m "chore(mobile): 添加照片功能依赖和权限配置"
```

### Task 2: 实现图片服务

**Files:**
- Create: `packages/mobile/src/services/imageService.ts`
- Test: `packages/mobile/src/services/imageService.test.ts`

- [ ] **Step 1: 编写测试**

测试拍照、选择图片、压缩功能

- [ ] **Step 2: 实现图片服务**

```typescript
import { launchCamera, launchImageLibrary } from 'react-native-image-picker'
import ImageResizer from 'react-native-image-resizer'

export class ImageService {
  async takePhoto(): Promise<string> {
    // 拍照实现
  }

  async pickImage(): Promise<string> {
    // 选择图片实现
  }

  async compressImage(uri: string): Promise<string> {
    // 压缩到 800x800, 质量 80%
  }

  async uploadImage(uri: string): Promise<string> {
    // 调用 Server 的 /api/upload/image
  }
}
```

- [ ] **Step 3: 运行测试**

```bash
pnpm test imageService.test.ts
```

Expected: PASS

- [ ] **Step 4: 更新 PlatformAdapter**

添加 camera 方法到 platformAdapter.ts

- [ ] **Step 5: Commit**

```bash
git add src/services/imageService.ts src/adapters/platformAdapter.ts
git commit -m "feat(mobile): 实现图片服务（拍照、选择、压缩、上传）"
```

---

## Chunk 2: Mobile 洞察页面

### Task 3-7: 洞察页面功能（简要说明）

**Task 3: 创建洞察页面框架**
- Files: `packages/mobile/src/screens/InsightsScreen.tsx`
- TDD: 测试渲染 → 实现 → 测试通过 → Commit

**Task 4: 实现 BMI 分析组件**
- Files: `packages/mobile/src/components/BMIGauge.tsx`
- 功能: BMI 计算、可视化量表、分类显示
- 集成 Shared 的 calculateBMI 函数
- TDD: 测试计算和显示 → 实现 → 测试通过 → Commit

**Task 5: 实现趋势预测组件**
- Files: `packages/mobile/src/components/TrendChart.tsx`
- 功能: 线性回归预测 7/14/30 天后体重
- 集成 Shared 的 predictWeight 函数
- TDD: 测试预测 → 实现 → 测试通过 → Commit

**Task 6: 实现照片对比组件**
- Files: `packages/mobile/src/components/PhotoComparison.tsx`
- 功能: 选择多张照片并排显示
- TDD: 测试显示 → 实现 → 测试通过 → Commit

**Task 7: 实现健康建议**
- 基于数据生成个性化建议
- TDD: 测试生成逻辑 → 实现 → 测试通过 → Commit

---

## Chunk 3: Mobile 饮食页面

### Task 8-12: 饮食页面功能（简要说明）

**Task 8: 创建饮食页面框架**
- Files: `packages/mobile/src/screens/FoodScreen.tsx`
- TDD: 测试渲染 → 实现 → 测试通过 → Commit

**Task 9: 实现食物识别组件**
- Files: `packages/mobile/src/components/FoodRecognition.tsx`
- 功能: 拍照/选择图片 → 调用 Server API → 显示结果
- TDD: 测试识别流程 → 实现 → 测试通过 → Commit

**Task 10: 实现手动输入**
- 食物名称和卡路里输入表单
- TDD: 测试输入 → 实现 → 测试通过 → Commit

**Task 11: 实现每日卡路里汇总**
- 进度条、食物记录列表
- TDD: 测试显示 → 实现 → 测试通过 → Commit

**Task 12: 饮食页面集成测试**
- 测试完整的食物记录流程
- Commit

---

## Chunk 4: Mobile 成就系统

### Task 13-15: 成就系统（简要说明）

**Task 13: 实现成就检查逻辑**
- 集成 Shared 的成就检查函数
- 12 种成就类型：first_record, streak_7, streak_30, records_10, records_50, records_100, goal_achieved 等
- TDD: 测试检查逻辑 → 实现 → 测试通过 → Commit

**Task 14: 实现成就徽章组件**
- Files: `packages/mobile/src/components/AchievementBadge.tsx`
- 功能: 徽章图标、解锁动画、进度显示
- TDD: 测试显示 → 实现 → 测试通过 → Commit

**Task 15: 实现成就列表页面**
- Files: `packages/mobile/src/screens/AchievementsScreen.tsx`
- 显示已解锁和未解锁成就
- TDD: 测试显示 → 实现 → 测试通过 → Commit

---

## Chunk 5: Mobile 集成和优化

### Task 16: 更新 Tab 导航为 5 个 Tab

**Files:**
- Modify: `packages/mobile/src/navigation/TabNavigator.tsx`

- [ ] **Step 1: 添加洞察和饮食 Tab**

```typescript
<Tab.Screen name="Insights" component={InsightsScreen} options={{ title: '洞察' }} />
<Tab.Screen name="Food" component={FoodScreen} options={{ title: '饮食' }} />
```

- [ ] **Step 2: 测试导航**

- [ ] **Step 3: Commit**

```bash
git add src/navigation/TabNavigator.tsx
git commit -m "feat(mobile): 更新导航为 5 个 Tab"
```

### Task 17: Mobile Phase 3 集成测试

- [ ] **Step 1: 编写 E2E 测试**

测试洞察、饮食、成就功能

- [ ] **Step 2: 运行所有测试**

```bash
pnpm test
detox test
```

Expected: 所有测试通过

- [ ] **Step 3: Commit**

```bash
git add e2e/
git commit -m "test(mobile): 添加 Phase 3 功能 E2E 测试"
```

---

## Chunk 6: Taro 小程序初始化

### Task 18: 初始化 Taro 项目

**Files:**
- Create: `packages/miniapp/` (整个项目结构)

- [ ] **Step 1: 使用 Taro CLI 初始化**

```bash
cd packages
npx @tarojs/cli init miniapp
```

选择：
- 模板：默认模板
- 框架：React
- TypeScript：是
- CSS 预处理器：Sass

- [ ] **Step 2: 转换为 pnpm**

```bash
cd miniapp
rm -rf node_modules package-lock.json
pnpm install
```

- [ ] **Step 3: 添加 Shared 依赖**

修改 `package.json`：
```json
{
  "dependencies": {
    "@weight-tracker/shared": "workspace:*"
  }
}
```

- [ ] **Step 4: 安装依赖**

```bash
pnpm install
```

- [ ] **Step 5: 测试编译**

```bash
pnpm dev:weapp
```

Expected: 编译成功，可以在微信开发者工具中打开

- [ ] **Step 6: Commit**

```bash
git add packages/miniapp/
git commit -m "chore(miniapp): 初始化 Taro 小程序项目"
```

### Task 19-25: Taro 小程序功能实现（简要说明）

由于 Taro 小程序的功能与 Mobile 类似，只是使用不同的 UI 组件和 API，以下任务采用简化描述：

**Task 19: 实现 Taro 平台适配层**
- Files: `packages/miniapp/src/adapters/platformAdapter.ts`
- 使用 Taro.setStorage, Taro.getStorage, Taro.getNetworkType 等 API
- TDD: 测试适配层 → 实现 → 测试通过 → Commit

**Task 20-24: 实现 5 个页面**
- Task 20: 记录页面
- Task 21: 历史页面
- Task 22: 统计页面（使用 ECharts for Taro）
- Task 23: 洞察页面
- Task 24: 饮食页面（使用 Taro.chooseImage）

每个页面：
- 复用 Shared 的业务逻辑
- 使用 Taro UI 组件
- TDD: 测试 → 实现 → 测试通过 → Commit

**Task 25: 实现微信授权登录**
- 使用 Taro.login 获取 code
- 调用 Server 的 /api/auth/wechat-login
- TDD: 测试登录流程 → 实现 → 测试通过 → Commit

---

## Chunk 7: 最终集成和发布准备

### Task 26: 小程序功能测试

- [ ] **Step 1: 在微信开发者工具中测试所有功能**

- [ ] **Step 2: 真机测试**

- [ ] **Step 3: 修复发现的问题**

- [ ] **Step 4: Commit**

```bash
git add packages/miniapp/
git commit -m "fix(miniapp): 修复测试中发现的问题"
```

### Task 27: 性能优化

- [ ] **Step 1: Mobile 性能优化**

- 图片懒加载
- 列表虚拟滚动优化
- 状态更新优化

- [ ] **Step 2: 小程序性能优化**

- 分包加载
- 图片压缩
- 请求优化

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "perf: Phase 3 性能优化"
```

### Task 28: 最终验收测试

- [ ] **Step 1: 运行所有测试**

```bash
cd D:/workspace/weight-tracker
pnpm test
pnpm test:coverage
```

Expected:
- 所有测试通过
- 覆盖率 > 70%

- [ ] **Step 2: 手动测试清单**

Mobile:
- ✅ 5 个 Tab 都能正常切换
- ✅ 洞察页面功能正常
- ✅ 饮食识别功能正常
- ✅ 成就系统正常
- ✅ 照片上传正常

Miniapp:
- ✅ 5 个页面功能正常
- ✅ 微信登录正常
- ✅ 数据同步正常

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "test: Phase 3 最终验收测试通过"
```

---

## 验收标准

Phase 3 完成的标志：

**Mobile 应用：**
✅ 5 个 Tab 页面全部完成（记录、历史、统计、洞察、饮食）
✅ 洞察功能完整（BMI、趋势预测、照片对比、健康建议）
✅ 饮食功能完整（AI 识别、手动输入、卡路里追踪）
✅ 成就系统完整（12 种徽章、解锁动画）
✅ 照片功能完整（拍照、选择、压缩、上传）
✅ 所有功能测试通过

**Taro 小程序：**
✅ 5 个页面全部完成
✅ 复用 Shared 业务逻辑
✅ 微信授权登录正常
✅ 数据同步正常
✅ 可以在微信开发者工具中运行
✅ 真机测试通过

**质量保证：**
✅ 单元测试覆盖率 > 70%
✅ E2E 测试覆盖关键流程
✅ 性能指标达标
✅ 无严重 Bug

**下一步:** Phase 4 - 数据迁移和发布准备

