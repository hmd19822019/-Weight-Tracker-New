# 体重记录 App - 构建说明

## 项目简介

一个简单易用的 Android 体重记录应用，支持：
- ✅ 输入和保存体重记录
- ✅ 查看体重趋势图表
- ✅ 查看历史记录
- ✅ 统计分析（当前体重、平均体重、变化趋势）
- ✅ 数据导出（CSV 格式）
- ✅ 本地数据存储（使用 localStorage）

## 开发环境

- **框架**: Apache Cordova
- **前端**: HTML5 + CSS3 + JavaScript (ES6+)
- **图表库**: Chart.js
- **平台**: Android

## 构建 APK 的两种方式

### 方式一：本地构建（推荐用于开发）

#### 前置要求

1. **Java JDK 8 或更高版本**
   - 下载地址: https://www.oracle.com/java/technologies/downloads/
   - 安装后设置环境变量：
     ```powershell
     [System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Java\jdk-XX", "User")
     ```
     将 `jdk-XX` 替换为你安装的 JDK 版本

2. **Android SDK**
   - 下载并安装 Android Studio: https://developer.android.com/studio
   - Android Studio 会自动安装 Android SDK
   - 安装后设置环境变量：
     ```powershell
     [System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "User")
     [System.Environment]::SetEnvironmentVariable("Path", "$env:Path;$env:LOCALAPPDATA\Android\Sdk\platform-tools;$env:LOCALAPPDATA\Android\Sdk\tools;$env:LOCALAPPDATA\Android\Sdk\tools\bin", "User")
     ```

3. **安装 Android SDK 组件**
   - 打开 Android Studio → SDK Manager
   - 安装：
     - Android SDK Platform-Tools
     - Android SDK Build-Tools（最新版本）
     - Android API Level 35 或更高

#### 构建步骤

1. 进入项目目录：
   ```powershell
   cd "D:\openclaw-workspace\weight-tracker-app"
   ```

2. 构建调试版本 APK：
   ```powershell
   cordova build android --debug
   ```

3. 构建发布版本 APK（需要签名）：
   ```powershell
   cordova build android --release
   ```

4. 查找生成的 APK：
   - 调试版本: `platforms\android\app\build\outputs\apk\debug\app-debug.apk`
   - 发布版本: `platforms\android\app\build\outputs\apk\release\app-release-unsigned.apk`

#### 签名发布版本（可选）

如果需要发布到应用商店，需要对 APK 进行签名：

1. 生成密钥库：
   ```powershell
   keytool -genkey -v -keystore release-key.keystore -alias weight-tracker -keyalg RSA -keysize 2048 -validity 10000
   ```

2. 签名 APK：
   ```powershell
   jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore release-key.keystore app-release-unsigned.apk weight-tracker
   ```

### 方式二：在线构建（推荐用于快速测试）

#### 使用 PhoneGap Build

1. **将项目推送到 GitHub/GitLab**
   ```powershell
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/weight-tracker.git
   git push -u origin main
   ```

2. **访问 PhoneGap Build**: https://build.phonegap.com/

3. **上传项目**
   - 登录或注册账户
   - 点击 "Upload a .zip file"
   - 选择项目目录（排除 platforms 和 plugins 文件夹）
   - 或使用 GitHub 仓库链接

4. **等待构建完成**（通常需要几分钟）

5. **下载 APK**
   - 构建完成后，点击下载按钮即可获得 APK

#### 其他在线构建服务

- **Ionic Appflow**: https://ionic.io/
- **HoneyApp**: https://honeyapp.com/
- **Buildozer**: https://buildozer.io/

## 在浏览器中测试

如果你想先在浏览器中测试应用（无需安装 Android 工具）：

```powershell
cd "D:\openclaw-workspace\weight-tracker-app"
cordova serve
```

然后访问: http://localhost:8000

## 项目结构

```
weight-tracker-app/
├── config.xml          # Cordova 配置文件
├── package.json         # Node.js 依赖
├── platforms/           # 平台代码（Android）
│   └── android/
├── www/                 # Web 资源
│   ├── index.html       # 主页面
│   ├── css/
│   │   └── index.css    # 样式文件
│   └── js/
│       └── index.js     # 应用逻辑
└── README.md           # 本文件
```

## 应用功能说明

### 主要功能

1. **记录体重**
   - 输入体重（20-300kg）
   - 可选备注信息
   - 自动记录日期和时间

2. **查看统计**
   - 当前体重
   - 较上次变化
   - 平均体重

3. **趋势图表**
   - 体重变化曲线
   - 支持查看备注
   - 显示最近 30 条记录

4. **历史记录**
   - 完整记录列表
   - 支持删除单条记录
   - 按时间倒序排列

5. **数据导出**
   - 导出为 CSV 文件
   - 可用 Excel 打开
   - 包含日期、体重、备注

6. **数据管理**
   - 清空所有数据
   - 数据本地存储（安全）

## 技术细节

### 数据存储

使用 `localStorage` 存储数据，格式为 JSON：

```json
[
  {
    "date": "2026-03-03T15:30:00.000Z",
    "weight": 65.5,
    "note": "早上测量"
  }
]
```

### 图表

使用 Chart.js 绘制折线图，显示体重趋势。

### 响应式设计

应用采用响应式设计，适配不同屏幕尺寸。

## 自定义和修改

### 修改应用名称

编辑 `config.xml` 文件：
```xml
<name>你的应用名称</name>
```

### 修改包名

编辑 `config.xml` 文件：
```xml
<widget id="com.yourcompany.appname" ...>
```

### 修改主题色

编辑 `www/css/index.css`，修改 CSS 变量：
```css
:root {
    --primary-color: #2196F3;
    --primary-dark: #1976D2;
    /* ... */
}
```

## 常见问题

### Q: 构建失败，提示 "JAVA_HOME not set"
A: 需要安装 Java JDK 并设置 JAVA_HOME 环境变量。

### Q: 构建失败，提示 "Android SDK not found"
A: 需要安装 Android Studio 并设置 ANDROID_HOME 环境变量。

### Q: 如何在真机上测试？
A:
1. 启用开发者选项和 USB 调试
2. 连接手机到电脑
3. 运行 `cordova run android`

### Q: 数据会丢失吗？
A: 不会。数据存储在手机本地，卸载应用后才会丢失。建议定期导出备份。

## 许可证

MIT License

## 联系方式

如有问题或建议，欢迎反馈。

---

**祝你使用愉快！** 📊🦞
