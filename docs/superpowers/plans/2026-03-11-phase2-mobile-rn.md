# Phase 2: Mobile React Native 实施计划（修订版）

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现 React Native 移动端应用的核心功能，包含 3 个主 Tab（记录、历史、统计），集成 Shared 层业务逻辑，实现本地存储和云端同步。

**Architecture:** React Native 0.74+ 应用，使用 React Navigation 实现 Tab 导航，AsyncStorage 本地存储，集成 @weight-tracker/shared 包复用业务逻辑，实现平台适配层（PlatformAdapter）。

**Tech Stack:** React Native 0.74+, TypeScript, React Navigation 6.x, AsyncStorage, React Native Chart Kit, @react-native-community/netinfo, @weight-tracker/shared

**Prerequisites:** Phase 1 必须完成（Shared 包和 Server 包可用）

**Scope:** Phase 2 专注于核心功能（记录、历史、统计、认证、同步）。洞察、饮食、成就系统将在 Phase 3 实现。

---

## Phase 2 范围说明

**包含功能：**
- ✅ 体重记录页面（输入、快速模板、饮水追踪）
- ✅ 历史记录页面（列表、筛选、搜索、编辑/删除）
- ✅ 统计分析页面（图表、时间范围、统计卡片、目标进度）
- ✅ 用户认证（登录页面）
- ✅ 数据同步（自动同步、冲突解决）
- ✅ 设置页面（深色模式、语言、自动同步开关）

**不包含功能（Phase 3）：**
- ❌ 洞察页面（BMI分析、趋势预测、照片对比、健康建议）
- ❌ 饮食页面（AI识别、卡路里追踪、营养分析）
- ❌ 成就系统
- ❌ 照片上传功能

---

## 文件结构概览

```
packages/mobile/
├── android/
├── ios/
├── src/
│   ├── App.tsx
│   ├── navigation/
│   │   └── TabNavigator.tsx
│   ├── screens/
│   │   ├── RecordScreen.tsx
│   │   ├── HistoryScreen.tsx
│   │   ├── StatisticsScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── components/
│   │   ├── WeightChart.tsx
│   │   ├── RecordCard.tsx
│   │   ├── StatCard.tsx
│   │   └── WaterIntakeBar.tsx
│   ├── adapters/
│   │   └── platformAdapter.ts
│   ├── theme/
│   │   ├── colors.ts
│   │   └── typography.ts
│   └── utils/
│       └── storage.ts
├── __tests__/
├── e2e/
├── package.json
├── tsconfig.json
└── jest.config.js
```

---

## Chunk 1: React Native 项目初始化

### Task 1-3: 项目初始化和配置

参考原计划 Task 1-3，完成：
- React Native 项目初始化
- 测试环境配置
- 依赖安装（添加 @react-native-community/netinfo）

### Task 4: 实现平台适配层（修复版）

**Files:**
- Create: `packages/mobile/src/adapters/platformAdapter.ts`

修复网络检测实现：

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage'
import NetInfo from '@react-native-community/netinfo'
import type { PlatformAdapter } from '@weight-tracker/shared'

const platformAdapter: PlatformAdapter = {
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
  network: {
    async isConnected() {
      const state = await NetInfo.fetch()
      return state.isConnected ?? false
    }
  }
}

export default platformAdapter
```

---

## Chunk 2-7: 功能实现

由于修复后的计划与原计划大部分相同，以下任务参考原计划，但需注意：

**移除的任务：**
- 原 Task 13: 创建洞察页面框架 - 删除
- 原 Task 14: 创建饮食页面框架 - 删除
- 原 Task 17: 实现照片上传 - 删除
- 原 Task 31-35: 洞察页面功能 - 删除
- 原 Task 36-40: 饮食页面功能 - 删除

**保留的任务（重新编号）：**
- Task 5-8: 主题和工具（原计划）
- Task 9: Tab 导航（修改为 3 个 Tab）
- Task 10-12: 页面框架（记录、历史、统计）
- Task 13-17: 记录页面功能（移除照片上传）
- Task 18-22: 历史页面功能
- Task 23-27: 统计页面功能
- Task 28-32: 认证和同步功能
- Task 33-37: E2E 测试和优化

---

## 验收标准

Phase 2 完成的标志：

✅ React Native 应用可以在 iOS 和 Android 上运行
✅ 3 个核心 Tab 页面功能完整（记录、历史、统计）
✅ 集成 Shared 包，业务逻辑复用
✅ 本地存储正常工作（AsyncStorage）
✅ 云端同步功能正常（登录后自动同步）
✅ 冲突解决 UI 正常工作
✅ 单元测试覆盖率 > 70%
✅ E2E 测试覆盖关键流程
✅ 应用性能良好
✅ 深色模式支持
✅ 设置页面功能完整
✅ 网络状态检测正常工作

**Phase 2 不包含：**
- ❌ 洞察页面 - Phase 3
- ❌ 饮食页面 - Phase 3
- ❌ 成就系统 - Phase 3
- ❌ 照片功能 - Phase 3

**下一步:** Phase 3 - 高级功能（洞察、饮食、成就、照片）

