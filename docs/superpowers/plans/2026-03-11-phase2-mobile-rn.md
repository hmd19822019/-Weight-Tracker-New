# Phase 2: Mobile React Native 实施计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现 React Native 移动端应用，包含 5 个主 Tab（记录、历史、统计、洞察、饮食），集成 Shared 层业务逻辑，实现本地存储和云端同步。

**Architecture:** React Native 0.74+ 应用，使用 React Navigation 实现 Tab 导航，AsyncStorage 本地存储，集成 @weight-tracker/shared 包复用业务逻辑，实现平台适配层（PlatformAdapter）。

**Tech Stack:** React Native 0.74+, TypeScript, React Navigation 6.x, AsyncStorage, React Native Chart Kit, React Native Image Picker, @weight-tracker/shared

**Prerequisites:** Phase 1 必须完成（Shared 包和 Server 包可用）

---

## 文件结构概览

```
packages/mobile/
├── android/                    # Android 原生代码
├── ios/                        # iOS 原生代码
├── src/
│   ├── App.tsx                # 主应用入口
│   ├── navigation/
│   │   └── TabNavigator.tsx   # Tab 导航配置
│   ├── screens/
│   │   ├── RecordScreen.tsx   # 记录页面
│   │   ├── HistoryScreen.tsx  # 历史页面
│   │   ├── StatisticsScreen.tsx # 统计页面
│   │   ├── InsightsScreen.tsx # 洞察页面
│   │   ├── FoodScreen.tsx     # 饮食页面
│   │   ├── SettingsScreen.tsx # 设置页面
│   │   └── LoginScreen.tsx    # 登录页面
│   ├── components/
│   │   ├── WeightChart.tsx    # 图表组件
│   │   ├── RecordCard.tsx     # 记录卡片
│   │   ├── StatCard.tsx       # 统计卡片
│   │   └── WaterIntakeBar.tsx # 饮水进度条
│   ├── adapters/
│   │   └── platformAdapter.ts # 平台适配层
│   ├── theme/
│   │   ├── colors.ts          # 颜色主题
│   │   └── typography.ts      # 字体样式
│   └── utils/
│       └── storage.ts         # AsyncStorage 封装
├── __tests__/
├── e2e/                       # E2E 测试（Detox）
├── package.json
├── tsconfig.json
├── jest.config.js
├── metro.config.js
└── app.json
```

---

## Chunk 1: React Native 项目初始化

### Task 1: 初始化 React Native 项目

**Files:**
- Create: `packages/mobile/` (整个项目结构)

- [ ] **Step 1: 使用 React Native CLI 初始化项目**

```bash
cd packages
npx react-native@latest init mobile --template react-native-template-typescript
```

Expected: 创建 mobile 目录，包含 Android 和 iOS 项目

- [ ] **Step 2: 移动到 mobile 目录并测试**

```bash
cd mobile
npm start
```

在另一个终端：
```bash
npm run android  # 或 npm run ios
```

Expected: 应用在模拟器/真机上运行

- [ ] **Step 3: 清理默认代码**

删除 `App.tsx` 中的示例代码，保留基础结构

- [ ] **Step 4: 转换为 pnpm**

```bash
rm -rf node_modules package-lock.json
pnpm install
```

- [ ] **Step 5: 更新 package.json**

修改 `packages/mobile/package.json`，添加 shared 依赖：
```json
{
  "name": "mobile",
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.74.0",
    "@weight-tracker/shared": "workspace:*"
  }
}
```

- [ ] **Step 6: 安装依赖**

```bash
pnpm install
```

- [ ] **Step 7: 验证 workspace 链接**

创建测试文件验证可以导入 shared 包

- [ ] **Step 8: Commit**

```bash
git add packages/mobile/
git commit -m "chore(mobile): 初始化 React Native 项目"
```

### Task 2: 配置测试环境

**Files:**
- Create: `packages/mobile/jest.config.js`
- Modify: `packages/mobile/package.json`

- [ ] **Step 1: 安装测试依赖**

```bash
cd packages/mobile
pnpm add -D @testing-library/react-native @testing-library/jest-native jest
```

- [ ] **Step 2: 创建 Jest 配置**

创建 `jest.config.js`:
```javascript
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation)/)'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
}
```

- [ ] **Step 3: 添加测试脚本**

在 `package.json` 中添加：
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

- [ ] **Step 4: 创建示例测试**

创建 `src/App.test.tsx`:
```typescript
import React from 'react'
import { render } from '@testing-library/react-native'
import App from './App'

describe('App', () => {
  it('should render without crashing', () => {
    const { getByText } = render(<App />)
    expect(getByText).toBeDefined()
  })
})
```

- [ ] **Step 5: 运行测试**

```bash
pnpm test
```

Expected: 测试通过

- [ ] **Step 6: Commit**

```bash
git add jest.config.js package.json src/App.test.tsx
git commit -m "chore(mobile): 配置测试环境"
```

### Task 3: 安装核心依赖

**Files:**
- Modify: `packages/mobile/package.json`

- [ ] **Step 1: 安装导航库**

```bash
pnpm add @react-navigation/native @react-navigation/bottom-tabs
pnpm add react-native-screens react-native-safe-area-context
```

- [ ] **Step 2: 安装状态管理和工具库**

```bash
pnpm add zustand @react-native-async-storage/async-storage axios dayjs
```

- [ ] **Step 3: 安装 UI 组件库**

```bash
pnpm add react-native-chart-kit react-native-svg
pnpm add react-native-image-picker
```

- [ ] **Step 4: 链接原生模块（iOS）**

```bash
cd ios
pod install
cd ..
```

- [ ] **Step 5: 验证安装**

重新运行应用：
```bash
pnpm android  # 或 pnpm ios
```

Expected: 应用正常启动

- [ ] **Step 6: Commit**

```bash
git add package.json ios/Podfile.lock
git commit -m "chore(mobile): 安装核心依赖"
```

---

## Chunk 2: 平台适配层和基础组件

### Task 4: 实现平台适配层（TDD）

**Files:**
- Create: `packages/mobile/src/adapters/platformAdapter.ts`
- Test: `packages/mobile/src/adapters/platformAdapter.test.ts`

- [ ] **Step 1: 编写测试**

创建 `platformAdapter.test.ts`:
```typescript
import { platformAdapter } from './platformAdapter'

describe('PlatformAdapter', () => {
  describe('storage', () => {
    it('should save and retrieve data', async () => {
      await platformAdapter.storage.setItem('test', 'value')
      const value = await platformAdapter.storage.getItem('test')
      expect(value).toBe('value')
    })
  })

  describe('camera', () => {
    it('should have takePhoto method', () => {
      expect(platformAdapter.camera.takePhoto).toBeDefined()
    })
  })
})
```

- [ ] **Step 2: 运行测试验证失败**

```bash
pnpm test platformAdapter.test.ts
```

Expected: FAIL

- [ ] **Step 3: 实现平台适配层**

创建 `platformAdapter.ts`:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage'
import { launchCamera, launchImageLibrary } from 'react-native-image-picker'
import type { PlatformAdapter } from '@weight-tracker/shared'

export const platformAdapter: PlatformAdapter = {
  storage: {
    async getItem(key: string) {
      return await AsyncStorage.getItem(key)
    },
    async setItem(key: string, value: string) {
      await AsyncStorage.setItem(key, value)
    },
    async removeItem(key: string) {
      await AsyncStorage.removeItem(key)
    }
  },
  camera: {
    async takePhoto() {
      const result = await launchCamera({ mediaType: 'photo', quality: 0.8 })
      return result.assets?.[0]?.uri || ''
    },
    async pickImage() {
      const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 })
      return result.assets?.[0]?.uri || ''
    }
  },
  network: {
    async isConnected() {
      // 实现网络状态检查
      return true
    }
  }
}
```

- [ ] **Step 4: 运行测试验证通过**

```bash
pnpm test platformAdapter.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/adapters/
git commit -m "feat(mobile): 实现平台适配层"
```

### Task 5-8: 基础组件（简要说明）

**Task 5: 实现主题配置**
- Files: `src/theme/colors.ts`, `src/theme/typography.ts`
- 功能: 定义颜色、字体、间距等主题变量，支持深色模式
- TDD: 测试主题切换 → 实现 → 测试通过 → Commit

**Task 6: 实现图表组件**
- Files: `src/components/WeightChart.tsx`, 测试文件
- 功能: 使用 react-native-chart-kit 绘制折线图/柱状图
- TDD: 测试渲染 → 实现 → 测试通过 → Commit

**Task 7: 实现卡片组件**
- Files: `src/components/RecordCard.tsx`, `StatCard.tsx`, 测试文件
- 功能: 可复用的卡片组件
- TDD: 测试渲染 → 实现 → 测试通过 → Commit

**Task 8: 实现进度条组件**
- Files: `src/components/WaterIntakeBar.tsx`, 测试文件
- 功能: 饮水进度条，目标进度条
- TDD: 测试渲染和交互 → 实现 → 测试通过 → Commit

---

## Chunk 3: Tab 导航和页面框架

### Task 9: 实现 Tab 导航（TDD）

**Files:**
- Create: `packages/mobile/src/navigation/TabNavigator.tsx`
- Test: `packages/mobile/src/navigation/TabNavigator.test.tsx`

- [ ] **Step 1: 编写测试**

测试 Tab 导航渲染和切换

- [ ] **Step 2: 实现 Tab 导航**

创建 5 个 Tab：记录、历史、统计、洞察、饮食

- [ ] **Step 3: 运行测试**

```bash
pnpm test TabNavigator.test.tsx
```

Expected: PASS

- [ ] **Step 4: 集成到 App.tsx**

- [ ] **Step 5: 手动测试**

运行应用，验证 Tab 切换正常

- [ ] **Step 6: Commit**

```bash
git add src/navigation/ src/App.tsx
git commit -m "feat(mobile): 实现 Tab 导航"
```

### Task 10-14: 页面框架（简要说明）

为每个页面创建基础框架，后续任务填充具体功能。

**Task 10: 创建记录页面框架**
- Files: `src/screens/RecordScreen.tsx`, 测试文件
- 功能: 页面布局，占位组件
- TDD: 测试渲染 → 实现 → 测试通过 → Commit

**Task 11: 创建历史页面框架**
- Files: `src/screens/HistoryScreen.tsx`, 测试文件
- TDD: 测试渲染 → 实现 → 测试通过 → Commit

**Task 12: 创建统计页面框架**
- Files: `src/screens/StatisticsScreen.tsx`, 测试文件
- TDD: 测试渲染 → 实现 → 测试通过 → Commit

**Task 13: 创建洞察页面框架**
- Files: `src/screens/InsightsScreen.tsx`, 测试文件
- TDD: 测试渲染 → 实现 → 测试通过 → Commit

**Task 14: 创建饮食页面框架**
- Files: `src/screens/FoodScreen.tsx`, 测试文件
- TDD: 测试渲染 → 实现 → 测试通过 → Commit

---

## Chunk 4: 记录和历史功能实现

### Task 15-20: 记录页面功能（简要说明）

**Task 15: 实现体重输入表单**
- 集成 Shared 的 useWeightRecords hook
- 表单验证（20-300kg）
- TDD: 测试输入和验证 → 实现 → 测试通过 → Commit

**Task 16: 实现快速模板按钮**
- 晨起、运动后、睡前等模板
- TDD: 测试点击行为 → 实现 → 测试通过 → Commit

**Task 17: 实现照片上传**
- 集成 platformAdapter.camera
- 图片压缩和预览
- TDD: 测试拍照流程 → 实现 → 测试通过 → Commit

**Task 18: 实现饮水追踪**
- 进度条显示
- 快捷添加按钮
- TDD: 测试交互 → 实现 → 测试通过 → Commit

**Task 19: 实现数据保存**
- 调用 Shared 的 addWeightRecord
- 保存到 AsyncStorage
- TDD: 测试保存流程 → 实现 → 测试通过 → Commit

**Task 20: 记录页面集成测试**
- 测试完整的记录流程
- Commit

### Task 21-25: 历史页面功能（简要说明）

**Task 21: 实现记录列表**
- 使用 FlatList 渲染
- 按月分组显示
- TDD: 测试列表渲染 → 实现 → 测试通过 → Commit

**Task 22: 实现筛选功能**
- 全部/今日/本周/本月
- TDD: 测试筛选逻辑 → 实现 → 测试通过 → Commit

**Task 23: 实现搜索功能**
- 全文搜索备注
- TDD: 测试搜索 → 实现 → 测试通过 → Commit

**Task 24: 实现编辑/删除**
- 点击记录进入详情
- 编辑和删除操作
- TDD: 测试操作 → 实现 → 测试通过 → Commit

**Task 25: 历史页面集成测试**
- 测试完整的历史查看流程
- Commit

---

## Chunk 5: 统计和洞察功能实现

### Task 26-30: 统计页面功能（简要说明）

**Task 26: 实现图表展示**
- 集成 WeightChart 组件
- 折线图/柱状图/面积图切换
- TDD: 测试图表渲染 → 实现 → 测试通过 → Commit

**Task 27: 实现时间范围选择**
- 7/14/30/90/365天、全部
- TDD: 测试切换 → 实现 → 测试通过 → Commit

**Task 28: 实现统计卡片**
- 当前体重、平均值、最大最小值
- 集成 Shared 的 useStatistics hook
- TDD: 测试计算 → 实现 → 测试通过 → Commit

**Task 29: 实现目标进度**
- 进度条和百分比
- TDD: 测试显示 → 实现 → 测试通过 → Commit

**Task 30: 统计页面集成测试**
- Commit

### Task 31-35: 洞察页面功能（简要说明）

**Task 31: 实现 BMI 分析**
- BMI 计算和分类
- 可视化 BMI 量表
- TDD: 测试计算 → 实现 → 测试通过 → Commit

**Task 32: 实现趋势预测**
- 集成 Shared 的 predictWeight 函数
- 显示 7/14/30 天预测
- TDD: 测试预测 → 实现 → 测试通过 → Commit

**Task 33: 实现照片对比**
- 选择多张照片并排显示
- TDD: 测试显示 → 实现 → 测试通过 → Commit

**Task 34: 实现健康建议**
- 基于数据生成建议
- TDD: 测试生成逻辑 → 实现 → 测试通过 → Commit

**Task 35: 洞察页面集成测试**
- Commit

---

## Chunk 6: 饮食功能和数据同步

### Task 36-40: 饮食页面功能（简要说明）

**Task 36: 实现拍照识别**
- 集成 platformAdapter.camera
- 调用 Server 的 /api/food/recognize
- TDD: 测试识别流程 → 实现 → 测试通过 → Commit

**Task 37: 实现手动输入**
- 食物名称和卡路里输入
- TDD: 测试输入 → 实现 → 测试通过 → Commit

**Task 38: 实现每日汇总**
- 卡路里进度条
- 食物记录列表
- TDD: 测试显示 → 实现 → 测试通过 → Commit

**Task 39: 实现营养分析**
- 图表展示
- TDD: 测试渲染 → 实现 → 测试通过 → Commit

**Task 40: 饮食页面集成测试**
- Commit

### Task 41-45: 数据同步功能（简要说明）

**Task 41: 实现登录页面**
- Files: `src/screens/LoginScreen.tsx`
- 手机号验证码登录
- TDD: 测试登录流程 → 实现 → 测试通过 → Commit

**Task 42: 实现自动同步**
- 集成 Shared 的 useSync hook
- 后台定期同步
- TDD: 测试同步逻辑 → 实现 → 测试通过 → Commit

**Task 43: 实现冲突解决 UI**
- 显示冲突列表
- 用户选择保留哪个版本
- TDD: 测试 UI → 实现 → 测试通过 → Commit

**Task 44: 实现设置页面**
- Files: `src/screens/SettingsScreen.tsx`
- 深色模式、语言、自动同步开关
- TDD: 测试设置 → 实现 → 测试通过 → Commit

**Task 45: 数据同步集成测试**
- 测试完整的同步流程
- Commit

---

## Chunk 7: E2E 测试和优化

### Task 46: 配置 Detox E2E 测试

**Files:**
- Create: `packages/mobile/e2e/`
- Create: `.detoxrc.js`

- [ ] **Step 1: 安装 Detox**

```bash
pnpm add -D detox
```

- [ ] **Step 2: 配置 Detox**

创建 `.detoxrc.js` 配置文件

- [ ] **Step 3: 编写 E2E 测试**

测试关键用户流程：
- 添加体重记录
- 查看历史
- 查看统计
- 登录和同步

- [ ] **Step 4: 运行 E2E 测试**

```bash
detox test
```

Expected: 所有测试通过

- [ ] **Step 5: Commit**

```bash
git add e2e/ .detoxrc.js
git commit -m "test(mobile): 添加 E2E 测试"
```

### Task 47-50: 性能优化（简要说明）

**Task 47: 优化列表渲染**
- 使用 FlatList 的 getItemLayout
- 实现虚拟滚动
- Commit

**Task 48: 优化图片加载**
- 图片懒加载
- 缓存策略
- Commit

**Task 49: 优化状态更新**
- 使用 React.memo
- 避免不必要的重渲染
- Commit

**Task 50: 性能测试**
- 使用 React Native Performance Monitor
- 验证性能指标
- Commit

---

## 验收标准

Phase 2 完成的标志：

✅ React Native 应用可以在 iOS 和 Android 上运行
✅ 5 个主 Tab 页面功能完整
✅ 集成 Shared 包，业务逻辑复用
✅ 本地存储正常工作（AsyncStorage）
✅ 云端同步功能正常（登录后自动同步）
✅ 照片上传和 AI 识别功能正常
✅ 单元测试覆盖率 > 70%
✅ E2E 测试覆盖关键流程
✅ 应用性能良好（列表滚动流畅，图表渲染快速）
✅ 深色模式支持

**下一步:** Phase 3 - Taro 小程序实现

