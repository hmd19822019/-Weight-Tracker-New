# 体重管理 App - 重构版本

基于 React Native + Taro 的跨平台体重管理应用。

## 项目概述

这是体重管理应用的重构版本，从 Cordova 迁移到现代化技术栈。

**支持平台**：
- iOS / Android (React Native)
- 微信小程序 / 支付宝小程序 (Taro)

**核心功能**：
- 体重记录与追踪
- 历史数据查看与筛选
- 统计分析与图表展示
- 健康洞察与趋势预测
- AI 食物识别（百度 AI）
- 成就系统
- 本地优先 + 可选云备份

## 技术栈

- **移动端**: React Native 0.74+ + TypeScript
- **小程序**: Taro 3.6+ + TypeScript
- **共享层**: TypeScript + Zustand + Zod + Day.js
- **后端**: Node.js 20+ + Express + Prisma
- **数据库**: PostgreSQL 16
- **图片存储**: 阿里云 OSS
- **AI 服务**: 百度 AI 食物识别

## 项目结构

```
weight-tracker/
├── packages/
│   ├── mobile/              # React Native App
│   ├── miniapp/             # Taro 小程序
│   ├── shared/              # 共享代码层
│   └── server/              # Node.js 后端
├── docs/                    # 文档
│   └── superpowers/
│       └── specs/           # 设计规范
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## 快速开始

### 前置要求

- Node.js 20+
- pnpm 8+
- PostgreSQL 16
- Android Studio (Android 开发)
- Xcode (iOS 开发)

### 安装依赖

```bash
pnpm install
```

### 开发命令

```bash
# 启动 React Native 开发服务器
pnpm dev:mobile

# 启动 Taro 小程序开发
pnpm dev:miniapp

# 启动后端服务
pnpm dev:server

# 运行所有测试
pnpm test

# 类型检查
pnpm type-check

# 代码检查
pnpm lint
```

### 构建命令

```bash
# 构建 Android APK
pnpm build:android

# 构建 iOS
pnpm build:ios

# 构建小程序
pnpm build:miniapp

# 构建后端
pnpm build:server
```

## 文档

- [设计规范](./docs/superpowers/specs/2026-03-11-weight-tracker-refactor-design.md) - 完整的重构设计方案
- [旧版本 README](./README.old.md) - Cordova 版本的文档

## 开发进度

当前状态：**设计阶段完成**

- [x] 需求分析
- [x] 技术选型
- [x] 架构设计
- [x] 数据模型设计
- [x] API 设计
- [x] 安全方案设计
- [x] 测试策略设计
- [x] CI/CD 设计
- [ ] 实施计划编写
- [ ] 基础架构搭建
- [ ] 核心功能开发
- [ ] 高级功能开发
- [ ] 测试与优化
- [ ] 发布准备

## 数据迁移

从旧版本（Cordova）迁移数据：

1. 在旧版本中导出数据（JSON 格式）
2. 在新版本中选择"导入数据"
3. 选择导出的 JSON 文件
4. 等待迁移完成

详细迁移指南请参考设计文档第 7.1 节。

## 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，欢迎提 Issue。

---

**旧版本存档**: `D:\openclaw-workspace\weight-tracker-app`
