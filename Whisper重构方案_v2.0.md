# Whisper AI Real-time Translator · 产品重构方案

> 版本: v2.0  
> 日期: 2026-07-03  
> 重构原则: 宁可删功能，不留半成品 · 所有页面必须形成完整闭环

---

## 目录

1. [完整产品优化方案](#1)
2. [页面修改方案](#2)
3. [UI调整方案](#3)
4. [React组件调整方案](#4)
5. [接口调整方案](#5)
6. [数据库调整建议](#6)
7. [开发优先级](#7)
8. [项目最终目录结构](#8)
9. [最终系统结构图](#9)
10. [答辩演示流程](#10)

---

<a id="1"></a>
## 1. 完整产品优化方案

### 1.1 产品定位

| 项目 | 内容 |
|------|------|
| 系统名称 | **Whisper AI Real-time Translator** |
| 项目类型 | 课程设计（毕业设计） |
| 核心能力 | ① 实时语音翻译 ② AI 摘要 ③ 翻译历史管理 |
| 目标 | 95%+ 完成度的高质量答辩项目 |
| 设计语言 | Apple Vision Pro + Forest Glass + Linear |

### 1.2 功能矩阵（保留 vs 删除）

#### ✅ 保留功能

| 模块 | 子功能 | 说明 |
|------|--------|------|
| **Login** | 用户名/密码登录 | 已对接后端 |
| **Login** | 注册 | 已对接后端 |
| **Login** | Token 自动管理 | 已实现 |
| **Translate** | 语言选择器 | 源语言/目标语言 + 交换 |
| **Translate** | 录音球 (WaveCircle) | 真实 MediaRecorder |
| **Translate** | 音频文件上传 (DragUpload) | 拖拽/点击上传 |
| **Translate** | 原文/译文双语卡片 | 带复制 + 播放 |
| **Translate** | AI Summary | 摘要 + 复制 + 导出 TXT |
| **Translate** | 逐句字幕时间线 | segments 渲染 |
| **History (用户)** | 历史记录列表 | 搜索 + 分页 |
| **History (用户)** | 详情 Drawer | 原文/译文/Summary/播放器/下载 |
| **Admin Dashboard** | 统计卡片 | 在线用户/今日翻译/总翻译/成功率/API耗时 |
| **Admin Dashboard** | 系统资源 | CPU/Memory/Disk/GPU |
| **Admin Dashboard** | 折线图 | 实时请求趋势图 |
| **Admin Monitor** | 实时任务 | WebSocket 推送 |
| **Admin Monitor** | 实时日志 | WebSocket 推送 |
| **Admin Monitor** | 队列统计 | Queue/Processing/Finished/Failed |
| **Admin History** | 历史记录时间轴 | 按日期分组 |
| **Admin Analytics** | 翻译数量趋势 | 折线图 |
| **Admin Analytics** | 语言占比 | 环形图 |
| **Admin Analytics** | 模型调用次数 | 进度条 |
| **Admin Analytics** | 成功率/平均耗时 | 统计卡片 |
| **Admin Settings** | 主题切换 | Dark/Forest/Aurora/Ocean |
| **Admin Settings** | 系统名称/语言/时区 | 可编辑可保存 |
| **Admin Settings** | 通知开关 | 可编辑可保存 |

#### ❌ 删除功能

| 功能 | 删除原因 |
|------|---------|
| Browser (`/app/web`) | 无关核心功能 |
| Assistant (`/app/ai`) | 无关核心功能 |
| Offline (`/app/offline`) | 无关核心功能 |
| Document (`/app/file`) | 无关核心功能 |
| Models (`/admin/models`) | 用户不关心模型管理 |
| Meeting Tab | 仅装饰，无点击事件 |
| Summary Tab | 仅装饰，无点击事件 |
| Export Tab | 仅装饰，无点击事件 |
| Google/Apple/GitHub Login | 无法在课程设计中实现 OAuth |
| Current Session (右侧面板) | 无实际数据来源 |
| Shortcut (右侧面板) | 无实际功能绑定 |
| Recent (右侧面板) | 移至 History 页面 |
| Recent Files | 无实际文件系统对接 |
| Right Side Panel (UserLayout) | 全部移除 |
| Thinking/Speaking 状态 | 无实际意义，简化状态机 |
| Regenerate 按钮 | 复杂度高，非核心 |
| Summary Tab 装饰 | 无实际功能 |
| **所有 TODO/占位符/空页面** | **开发原则：删除 > 半成品** |

### 1.3 状态机重构

```
当前（6个状态）        重构后（5个状态）

idle                  idle
listening     →       recording
thinking      →       transcribing
translating   →       translating
speaking      →       (删除)
finished      →       completed
```

**新流程：**

```
Idle → 点击录音球
  ↓
Recording（录音中，显示波形 + 时长）
  ↓ 自动停止（或手动停止）
Transcribing（Whisper 转写中）
  ↓
Translating（翻译中）
  ↓
Completed → 自动展示：原文 + 译文 + 字幕 + AI Summary（折叠）
  ↓
点击录音球重新开始
```

---

<a id="2"></a>
## 2. 页面修改方案

### 2.1 Login Page (`/login`)

| 修改项 | 当前 | 改为 |
|--------|------|------|
| 布局 | 居中卡片 + 背景森林图 | 居中卡片 + 背景动态渐变 + Forest Glass 效果 |
| Admin Mode 开关 | ✅ 已删除 | 保持删除 |
| 社交登录占位 | Google/Apple/GitHub | 全部删除 |
| 表单字段 | Username + Password + Email（注册） | 保持不变（已对接后端） |
| Sign Up 链接 | 存在 | 保持（可切换注册模式） |

### 2.2 Translate Page (`/app`) — 核心重构

| 修改项 | 当前 | 改为 |
|--------|------|------|
| 布局 | 三栏：侧栏 + 内容 + 右侧面板 | **单栏极简布局** |
| 侧栏导航 | 8 个导航项 | 缩减为 3 个：Translate / History / Settings |
| 右侧面板 | Recent + Current Session + Shortcuts | **全部删除** |
| 顶栏 Tab | Meeting / Subtitle / Export / Summary 四个装饰 Tab | **全部删除** |
| 页面焦点 | 多个视觉元素竞争 | **仅有录音球** |
| Logo | "AI Translator" + "Speech Translation" 双行 | **保持但简化文案** |
| 语言选择器 | 胶囊式 + Select | **保持**（微调样式） |
| 原文/译文卡片 | 并排 flex 布局 | **上下排列**（Original → Translation → AI Summary → Subtitles） |
| AI Summary | 占位（无数据） | **默认折叠，点击 Generate Summary 生成** |
| 底部 Dock | Online/GPT-4 Turbo/26ms | **删除**（无实际数据） |
| DragUpload | 存在 | **保留** |

### 2.3 History Page (`/app/history`) — 重新设计

| 修改项 | 当前（初步实现） | 改为 |
|--------|----------------|------|
| 布局 | 单列时间轴 | **双栏：左列表 + 右详情** |
| 搜索 | Search 组件 | 保持 |
| 分页 | 底部页码 | 保持 |
| 详情 | 跳转回 `/app`（占位） | **右侧详情面板：原文/译文/Summary/播放器/下载** |
| 播放音频 | 无功能 | **集成 SyncPlayer 播放音频** |
| 下载 TXT | `exportHistory()` 已对接 | 保持 |
| 删除 | 无 | **新增删除按钮**（`DELETE /api/history/{id}`） |

### 2.4 Admin Dashboard (`/admin`) — 必须全部真实数据

| 修改项 | 当前 | 改为 |
|--------|------|------|
| Active Users | API 调用（有 fallback） | **强制 API 数据，无 fallback** |
| Today Tasks | API 调用（有 fallback） | **强制 API 数据** |
| GPU Usage | API 调用 | **强制 API 数据** |
| AI Accuracy | API 调用 | **强制 API 数据** |
| Real-time Requests | API / 硬编码 fallback | **强制 API 数据** |
| CPU/Memory/Disk | Memory/Disk 硬编码 | **全部从 API 获取** |
| Network/Model/Whisper 状态 | 硬编码 | **从健康检查 API 获取** |
| API 耗时 | 无 | **新增：平均 API 耗时卡片** |

### 2.5 Admin Monitor (`/admin/monitor`)

| 修改项 | 当前 | 改为 |
|--------|------|------|
| 数据获取方式 | 轮询 `GET /api/admin/monitor` | **WebSocket 实时推送** |
| 活跃请求 | API 调用 | WebSocket 实时更新 |
| 日志流 | API 调用 | WebSocket 实时追加 |
| 队列统计 | API 调用 | WebSocket 实时更新 |

### 2.6 Admin Analytics (`/admin/analytics`)

| 修改项 | 当前 | 改为 |
|--------|------|------|
| Users Trend | 硬编码 | **从 Analytics API 获取** |
| Translation Count | API 调用 (totalTasks) | 保持 |
| Completion Rate | API 调用 | 保持 |
| Today Tasks | API 调用 | 保持 |
| Peak Time | 硬编码 | **从 API 获取** |
| Language Distribution | 硬编码 | **从 API 获取** |
| Model Usage | 硬编码 | **从 API 获取** |
| 平均耗时 | 无 | **新增统计卡片** |

### 2.7 Admin Settings (`/admin/settings`)

| 修改项 | 当前 | 改为 |
|--------|------|------|
| 分类 | General + Appearance 有数据，其余无 | **只保留：General / Appearance / Notification** |
| 系统名称 | 只读展示 | **可编辑输入框 + 保存按钮** |
| 语言 | 只读展示 | **Select 下拉 + 保存** |
| 时区 | 只读展示 | **Select 下拉 + 保存** |
| 主题 | 四色圆点选择 + 已持久化 | **保持** |
| 通知 | 展示配置（数据有限） | **Switch 开关 + 保存** |

### 2.8 删除的页面/路由

| 路由 | 当前行为 | 操作 |
|------|---------|------|
| `/app/file` | 无页面 | **删除路由** |
| `/app/web` | 无页面 | **删除路由** |
| `/app/ai` | 无页面 | **删除路由** |
| `/app/offline` | 无页面 | **删除路由** |
| `/app/settings` | 路由未注册 | **新增 Translate 内嵌设置** 或保持待实现（优先级低） |
| `/admin/models` | 已实现但有 API | **删除路由和组件** |
| `/admin/users` | 已实现 | **保留（用户管理对 Admin 有意义）** |

---

<a id="3"></a>
## 3. UI调整方案

### 3.1 设计系统

| 维度 | 规范 |
|------|------|
| 主色 | `#4ADE80` (Forest Green) |
| 背景色 | `#0A100E` (深森林黑) |
| 字体 | 无衬线字体，统一 `var(--font-sans)` |
| 圆角 | 统一 **24px**（卡片） / **12px**（按钮） / **8px**（小元素） |
| Glass | `backdrop-filter: blur(30px) saturate(200%)` |
| 阴影 | `box-shadow: 0 4px 24px rgba(0,0,0,0.4)` |
| 动画速度 | 统一 `220ms ease-out` |
| 留白 | 最小间距 16px，区块间距 32px+ |
| 图标 | 统一 Ant Design 图标，18px/24px/32px 三档 |
| 按钮 | 统一高度 44px，圆角 12px |

### 3.2 Translate 页面布局

```
┌──────────────────────────────────────────┐
│                   Logo                    │
│           Whisper AI Translator            │
│                                          │
│          English  ⇄  中文                 │
│                                          │
│               ● 录音球 ●                   │  ← 页面唯一视觉焦点
│              (140px sphere)               │
│                                          │
│         Drop audio file                   │  ← DragUpload
│                                          │
│  ┌────────────────────────────────────┐   │
│  │  Original                          │   │
│  │  [Hello everyone...]               │   │
│  │  [🔊 Copy]                         │   │
│  └────────────────────────────────────┘   │
│                                          │
│  ┌────────────────────────────────────┐   │
│  │  Translation                       │   │
│  │  [大家好...]                         │   │
│  │  [🔊 Copy]                         │   │
│  └────────────────────────────────────┘   │
│                                          │
│  ┌▸ AI Summary  (点击展开)                │   │
│  │  Summary / Keywords / Action Items     │   │
│  │  [Copy] [Export TXT]                  │   │
│  └────────────────────────────────────┘   │
│                                          │
│  ┌────────────────────────────────────┐   │
│  │  逐句字幕                           │   │
│  │  Hello everyone → 大家好             │   │
│  │  welcome to AI → 欢迎体验 AI         │   │
│  └────────────────────────────────────┘   │
└──────────────────────────────────────────┘
```

### 3.3 History 页面布局

```
┌──────────────────────────────────────────────────┐
│  History                                         │
│  128 translation records                         │
│                                                  │
│  [🔍 Search transcriptions...]                   │
│                                                  │
│  ┌────────────────────┐ ┌──────────────────────┐ │
│  │  2026-07-03        │ │  #42 EN → ZH          │ │
│  │                     │ │  ────────────────     │ │
│  │  14:30 EN→ZH       │ │  Original             │ │
│  │  14:22 ZH→EN       │ │  Hello everyone...    │ │
│  │  13:15 EN→JA       │ │                       │ │
│  │                     │ │  Translation          │ │
│  │  2026-07-02        │ │  大家好...             │ │
│  │                     │ │                       │ │
│  │  10:05 EN→ZH       │ │  ┌────────────────┐   │ │
│  │  09:30 ZH→EN       │ │  │ ▶ Play Audio   │   │ │
│  │                     │ │  │ 📄 Download TXT│   │ │
│  │  ◀ 1 2 3 ... ▶     │ │  │ 🗑 Delete      │   │ │
│  │                     │ │  └────────────────┘   │ │
│  └────────────────────┘ └──────────────────────┘ │
└──────────────────────────────────────────────────┘
```

### 3.4 Dashboard 布局

```
┌──────────────────────────────────────────────────┐
│  AI Control Center                                │
│  System overview · Real-time monitoring           │
│                                                  │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│  │ 1.2K │ │ 842  │ │ 12K  │ │ 98.4%│ │ 26ms │  │
│  │Users │ │Today  │ │Total │ │Success│ │API   │  │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘  │
│                                                  │
│  ┌──────────────────────┐ ┌──────────────────┐  │
│  │  Real-time Requests   │ │  System Status    │  │
│  │  [折线图]              │ │  CPU ████████░░ 72%│  │
│  │                       │ │  Mem ██████░░░░ 54%│  │
│  │                       │ │  Disk███░░░░░░░ 38%│  │
│  │                       │ │  GPU ███████░░░ 73%│  │
│  │                       │ │                    │  │
│  │                       │ │  Network ● Online  │  │
│  │                       │ │  Whisper ● Running │  │
│  └──────────────────────┘ └──────────────────┘  │
└──────────────────────────────────────────────────┘
```

---

<a id="4"></a>
## 4. React组件调整方案

### 4.1 新增组件

| 组件名 | 功能 | 位置 |
|--------|------|------|
| `Layout/AuthLayout.tsx` | 登录页面布局（背景 + 卡片） | `components/Layout/` |
| `Layout/UserLayout.tsx` | 用户端布局（**不含右侧面板**） | `components/Layout/` |
| `Layout/AdminLayout.tsx` | 管理员布局 | `components/Layout/` |
| `Layout/HistoryDetail.tsx` | 历史详情面板（原文/译文/Summary/播放器） | `components/History/` |
| `Layout/SummaryCard.tsx` | AI 摘要卡片（可折叠 + 生成/复制/导出） | `components/Translate/` |
| `Layout/LanguageSelector.tsx` | 语言选择器 + 交换按钮 | `components/Translate/` |
| `Layout/DashboardCard.tsx` | 统计卡片组件 | `components/Admin/` |
| `Layout/SystemStatus.tsx` | 系统状态面板（CPU/Memory/Disk/GPU） | `components/Admin/` |
| `Layout/WebSocketProvider.tsx` | WebSocket 连接管理 + 实时数据 Context | `providers/` |

### 4.2 修改组件

| 组件名 | 修改内容 |
|--------|---------|
| `WaveCircle.tsx` | 状态改为 `idle/recording/transcribing/translating/completed`；移除 thinking/speaking 状态 |
| `TranslationPage.tsx` | 删除 Tab 栏 / Dock / 右侧面板引用；简化布局为单栏；集成 SummaryCard |
| `UserLayout.tsx` | 导航项缩减为 Translate/History/Settings；删除右侧 Recent/Session/Shortcuts 面板 |
| `AdminSettings.tsx` | 只保留 General/Appearance/Notification；所有字段可编辑可保存 |
| `AdminMonitor.tsx` | 改为 WebSocket 数据源；移除轮询逻辑 |
| `HistoryPage.tsx` | 改为双栏布局；集成 HistoryDetail |
| `AdminHistory.tsx` | 新增删除功能；新增播放器集成 |
| `App.tsx` | 删除 `/app/file` `/app/web` `/app/ai` `/app/offline` `/admin/models` 路由 |

### 4.3 删除组件

| 组件名 | 原因 |
|--------|------|
| `AdminModels.tsx` | 页面删除 |
| `SyncPlayer.tsx` | **保留但重构**（非删除，集成到 HistoryDetail） |
| `ResultCard.tsx` | 功能被 TranslationPage 内联卡片取代 |

### 4.4 Hooks 调整

| Hook | 当前 | 改为 |
|------|------|------|
| `useRecorder.ts` | MediaRecorder + File 输出 | **保持不变**（已实现完整功能） |
| `useAuth.ts` | 空壳 | **实现完整：判断登录态 / Token 有效期 / 自动跳转** |
| `useWebSocket.ts` | 无 | **新增：WebSocket 连接 + 自动重连 + 消息分发** |
| `useSummary.ts` | 无 | **新增：AI Summary 生成 + 复制 + 导出 TXT** |
| `useTheme.ts` | 无 | **新增：主题切换逻辑 + 持久化** |

### 4.5 组件树

```
App
├── AuthLayout
│   └── AuthPage (Login / Register)
│
├── UserLayout (nav: Translate / History / Settings)
│   ├── TranslatePage
│   │   ├── LanguageSelector
│   │   ├── WaveCircle
│   │   ├── DragUpload
│   │   ├── BilingualCard (Original + Translation)
│   │   ├── SummaryCard (折叠)
│   │   └── SubtitleTimeline
│   │
│   ├── HistoryPage
│   │   ├── SearchBar
│   │   ├── HistoryList (左侧)
│   │   └── HistoryDetail (右侧)
│   │       ├── BilingualCard
│   │       ├── SyncPlayer
│   │       └── ActionButtons (Play / Download / Delete)
│   │
│   └── SettingsPage (可选)
│
├── AdminLayout (nav: Dashboard / Users / History / Monitor / Analytics / Settings)
│   ├── AdminDashboard
│   │   ├── DashboardCard (×5)
│   │   ├── RequestChart
│   │   └── SystemStatus
│   │
│   ├── AdminUsers
│   │   ├── UserCardList
│   │   └── UserDetailDrawer
│   │
│   ├── AdminMonitor
│   │   ├── ActiveRequests (WebSocket)
│   │   ├── LogStream (WebSocket)
│   │   └── QueueStatus (WebSocket)
│   │
│   ├── AdminHistory
│   │   ├── TimelineList
│   │   ├── HistoryDetail
│   │   └── SyncPlayer
│   │
│   ├── AdminAnalytics
│   │   ├── StatCards
│   │   ├── TrendChart
│   │   ├── LanguageDonut
│   │   ├── ModelUsageBar
│   │   └── PeakTimeChart
│   │
│   └── AdminSettings
│       ├── GeneralSettings
│       ├── ThemeSelector
│       └── NotificationToggle
```

---

<a id="5"></a>
## 5. 接口调整方案

### 5.1 无需修改的接口

| 接口 | 说明 |
|------|------|
| `POST /api/auth/login` | 已对接，不变 |
| `POST /api/auth/register` | 已对接，不变 |
| `GET /api/auth/info` | 已对接，不变 |
| `POST /api/translate` | 已对接，不变 |
| `GET /api/translate/{id}` | 已对接，不变 |
| `PUT /api/translate/{id}/process` | 已对接，不变 |
| `GET /api/history` | 已对接，不变 |
| `GET /api/history/{id}/export` | 已对接，不变 |
| `GET /api/admin/dashboard` | 已对接，**需扩展字段** |
| `GET /api/admin/users` | 已对接，不变 |
| `GET /api/admin/users/{id}` | 已对接，不变 |
| `GET /api/admin/logs` | 已对接，不变 |
| `GET /api/admin/settings` | 已对接，不变 |
| `PUT /api/admin/settings` | 已对接，不变 |
| `GET /api/admin/analytics/overview` | 已对接，**需扩展字段** |

### 5.2 需扩展的接口

#### `GET /api/admin/dashboard` — 扩展字段

```typescript
// 当前返回
interface DashboardData {
  totalUsers: number;
  todayTasks: number;
  completedTasks: number;
  processingTasks: number;
  gpuUsage: number;
  accuracy: number;
  avgLatency: string;
  recentRequests: number[];
}

// 需扩展为
interface DashboardData {
  totalUsers: number;          // 在线用户
  todayTasks: number;          // 今日翻译数量
  totalTasks: number;          // 总翻译数量
  completionRate: number;      // 成功率 (%)
  avgLatency: string;          // API 平均耗时
  cpuUsage: number;            // CPU 使用率
  memoryUsage: number;         // 内存使用率
  diskUsage: number;           // 磁盘使用率
  gpuUsage: number;            // GPU 使用率
  networkStatus: string;       // "online" | "offline"
  whisperStatus: string;       // "running" | "stopped"
  recentRequests: number[];    // 实时请求折线图数据
}
```

#### `GET /api/admin/analytics/overview` — 扩展字段

```typescript
// 当前返回
interface AnalyticsOverview {
  totalTasks: number;
  completionRate: number;
  todayTasks: number;
}

// 需扩展为
interface AnalyticsOverview {
  totalTasks: number;           // 总翻译数量
  completionRate: number;       // 成功率 (%)
  todayTasks: number;           // 今日任务数
  avgLatency: string;           // 平均耗时
  userTrend: number[];          // 用户趋势 (12个数据点)
  taskTrend: number[];          // 任务趋势 (12个数据点)
  languageDistribution: [       // 语言分布
    { language: string; percentage: number }
  ];
  modelUsage: [                 // 模型调用次数
    { model: string; count: number; percentage: number }
  ];
  peakTime: [                   // 高峰时段
    { hour: number; count: number }
  ];
  successRate: number;          // 成功率 (%)
}
```

### 5.3 需新增的接口

| 接口 | 方法 | 用途 |
|------|------|------|
| `DELETE /api/history/{id}` | DELETE | 用户端/管理端删除翻译记录 |
| `GET /api/translate/{id}/summary` | GET | 获取 AI 摘要内容 |
| `POST /api/translate/{id}/summary` | POST | 生成 AI 摘要（含会议摘要/关键词/待办事项） |
| `WS /ws/monitor` | WebSocket | 实时推送监控数据（活跃请求/队列/日志） |
| `GET /api/admin/health` | GET | 健康检查（Network / Whisper / 模型状态） |

### 5.4 可删除的接口

| 接口 | 删除原因 |
|------|---------|
| `GET /api/admin/models` | Models 页面删除 |
| `PUT /api/admin/models/{id}` | Models 页面删除 |

---

<a id="6"></a>
## 6. 数据库调整建议

### 6.1 当前实体分析

假设当前已有以下表结构（基于 Controller 推断）：

```sql
-- users 表：已存在
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100),
  role VARCHAR(20) DEFAULT 'USER',
  avatar VARCHAR(255),
  status INT DEFAULT 1,
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- translation_tasks 表：已存在
CREATE TABLE translation_tasks (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT,
  src_lang VARCHAR(10),
  tgt_lang VARCHAR(10),
  status VARCHAR(20),
  transcription TEXT,
  translation TEXT,
  audio_duration DOUBLE,
  audio_file VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- system_settings 表：已存在或可在内存中管理
CREATE TABLE system_settings (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(50) UNIQUE,
  setting_value TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 6.2 需调整的表

#### ✅ 新增：`translation_segments` 表

```sql
CREATE TABLE translation_segments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  task_id BIGINT NOT NULL,
  seq INT NOT NULL,
  start_time DOUBLE,
  end_time DOUBLE,
  source_text TEXT,
  target_text TEXT,
  confidence DOUBLE,
  FOREIGN KEY (task_id) REFERENCES translation_tasks(id) ON DELETE CASCADE
);
```

#### ✅ 新增：`translation_summaries` 表

```sql
CREATE TABLE translation_summaries (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  task_id BIGINT UNIQUE NOT NULL,
  summary TEXT,
  keywords TEXT,
  action_items TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES translation_tasks(id) ON DELETE CASCADE
);
```

#### ✅ 新增：`system_logs` 表

```sql
CREATE TABLE system_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  action VARCHAR(100),
  detail TEXT,
  level VARCHAR(20) DEFAULT 'INFO',
  user_id BIGINT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### ✅ 新增：`api_metrics` 表（用于 Dashboard 数据）

```sql
CREATE TABLE api_metrics (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  metric_type VARCHAR(50),       -- 'translation_count', 'latency', 'success_rate', 'user_count'
  metric_value DOUBLE,
  recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_type_time (metric_type, recorded_at)
);
```

#### ⏭ 无需调整的表

- `users` — 结构完整
- `translation_tasks` — 结构完整，可加入 `audio_file` 字段确认
- `system_settings` — 结构完整

---

<a id="7"></a>
## 7. 开发优先级

### Phase 1: 核心翻译流重构（1-2天）

**目标: 翻译流程形成完整闭环**

| 优先级 | 任务 | 涉及文件 |
|--------|------|---------|
| P0 | WaveCircle 状态机重构 (6态→5态) | `WaveCircle.tsx`, `WaveCircle.css` |
| P0 | TranslationPage 布局重构（删除 Tab/Dock/右侧栏） | `TranslationPage.tsx` |
| P0 | UserLayout 导航缩减为 3 项 + 删除右侧面板 | `UserLayout.tsx`, `UserLayout.css` |
| P0 | Delete all unused routes in App.tsx | `App.tsx` |
| P0 | AI Summary 功能实现（生成/复制/导出 TXT） | `SummaryCard.tsx`, 后端 `POST /api/translate/{id}/summary` |
| P0 | 后端 Summary 接口 | `TranslationController.java` |

### Phase 2: History 重构（1天）

**目标: 历史管理形成完整闭环**

| 优先级 | 任务 | 涉及文件 |
|--------|------|---------|
| P1 | HistoryPage 双栏布局重构 | `HistoryPage.tsx` |
| P1 | HistoryDetail 组件（原文/译文/Summary/播放器） | `HistoryDetail.tsx` |
| P1 | 播放功能集成 SyncPlayer | `SyncPlayer.tsx` |
| P1 | 删除功能 （前端 + 后端） | `historyService.ts`，后端 `DELETE /api/history/{id}` |
| P1 | 后端删除接口 | `TranslationController.java` |

### Phase 3: Admin Dashboard 真实数据（1天）

**目标: Dashboard 全部真实数据、无 hardcode**

| 优先级 | 任务 | 涉及文件 |
|--------|------|---------|
| P1 | Dashboard 接口扩展（CPU/Memory/Disk/avgLatency） | 后端 `DashboardController` |
| P1 | SystemStatus 组件（真实系统资源） | `SystemStatus.tsx` |
| P1 | 移除所有 fallback 硬编码 | `AdminDashboard.tsx` |
| P1 | 健康检查接口 | 后端 `GET /api/admin/health` |

### Phase 4: WebSocket 实时推送（1天）

**目标: Monitor 页面实时更新**

| 优先级 | 任务 | 涉及文件 |
|--------|------|---------|
| P2 | WebSocket 后端实现 | `WebSocketPushController.java` |
| P2 | `useWebSocket` Hook | `hooks/useWebSocket.ts` |
| P2 | AdminMonitor WebSocket 集成 | `AdminMonitor.tsx` |
| P2 | Monitor 删除轮询逻辑 | `AdminMonitor.tsx` |

### Phase 5: Admin Analytics 真实数据 + Settings 完善（0.5天）

| 优先级 | 任务 | 涉及文件 |
|--------|------|---------|
| P2 | Analytics 接口扩展 | 后端 `AnalyticsController` |
| P2 | 所有图表对接真实数据 | `AdminAnalytics.tsx` |
| P2 | Settings 全部字段可编辑可保存 | `AdminSettings.tsx` |

### Phase 6: 清理 & 优化（0.5天）

| 优先级 | 任务 | 涉及文件 |
|--------|------|---------|
| P3 | 删除所有无用组件/文件 | 全局 |
| P3 | 统一 Loading / Error / Toast 处理 | 全局 |
| P3 | UI 微调：动画/留白/圆角一致性 | 全局 CSS |
| P3 | 路由守卫 + Token 过期处理 | `useAuth.ts`, `App.tsx` |

---

<a id="8"></a>
## 8. 项目最终目录结构

```
whisper/
├── frontend/                          # React 前端
│   ├── src/
│   │   ├── main.tsx                   # 入口
│   │   ├── App.tsx                    # 路由配置（精简后）
│   │   │
│   │   ├── styles/
│   │   │   ├── global.css             # 全局样式 + CSS 变量 + 主题
│   │   │   ├── theme.css              # 主题系统（Dark/Forest/Aurora/Ocean）
│   │   │   └── animations.css         # 统一动画
│   │   │
│   │   ├── providers/
│   │   │   ├── AuthProvider.tsx        # 认证状态 Context
│   │   │   ├── ThemeProvider.tsx       # 主题 Context
│   │   │   └── WebSocketProvider.tsx   # WebSocket 连接管理
│   │   │
│   │   ├── services/
│   │   │   ├── api.ts                  # 统一 API 层（所有后端调用）
│   │   │   └── websocket.ts           # WebSocket 客户端
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.ts             # 认证 Hook
│   │   │   ├── useRecorder.ts         # MediaRecorder Hook
│   │   │   ├── useWebSocket.ts        # WebSocket Hook
│   │   │   ├── useSummary.ts          # AI Summary Hook
│   │   │   ├── useTheme.ts            # 主题 Hook
│   │   │   └── useHistory.ts          # 历史记录 Hook（搜索/分页/删除）
│   │   │
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── AuthPage.tsx       # 登录/注册页面
│   │   │   │   └── AuthPage.css
│   │   │   │
│   │   │   ├── translate/
│   │   │   │   ├── TranslatePage.tsx   # 翻译主页（单栏极简）
│   │   │   │   └── TranslatePage.css
│   │   │   │
│   │   │   ├── history/
│   │   │   │   ├── HistoryPage.tsx     # 历史记录（双栏）
│   │   │   │   └── HistoryPage.css
│   │   │   │
│   │   │   ├── settings/
│   │   │   │   ├── SettingsPage.tsx    # 用户设置
│   │   │   │   └── SettingsPage.css
│   │   │   │
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.tsx  # 仪表盘（全部真实数据）
│   │   │       ├── AdminUsers.tsx      # 用户管理
│   │   │       ├── AdminMonitor.tsx    # 实时监控（WebSocket）
│   │   │       ├── AdminHistory.tsx    # 翻译记录管理
│   │   │       ├── AdminAnalytics.tsx  # 数据分析（全部真实数据）
│   │   │       ├── AdminSettings.tsx   # 系统设置
│   │   │       ├── AdminLayout.tsx     # 管理后台布局
│   │   │       └── AdminLayout.css
│   │   │
│   │   └── components/
│   │       ├── Layout/
│   │       │   ├── AuthLayout.tsx      # 登录页布局
│   │       │   ├── UserLayout.tsx      # 用户端布局（精简后）
│   │       │   └── UserLayout.css
│   │       │
│   │       ├── Translate/
│   │       │   ├── WaveCircle.tsx      # 录音球（5态）
│   │       │   ├── WaveCircle.css
│   │       │   ├── LanguageSelector.tsx # 语言选择器 + 交换
│   │       │   ├── BilingualCard.tsx   # 双语卡片（原文/译文）
│   │       │   ├── SummaryCard.tsx     # AI 摘要（折叠/生成/复制/导出）
│   │       │   ├── SubtitleTimeline.tsx# 逐句字幕时间线
│   │       │   └── DragUpload.tsx      # 拖拽上传
│   │       │
│   │       ├── History/
│   │       │   ├── HistoryList.tsx     # 历史列表（左侧）
│   │       │   ├── HistoryDetail.tsx   # 历史详情（右侧）
│   │       │   └── SyncPlayer.tsx      # 音频同步播放器
│   │       │
│   │       └── Admin/
│   │           ├── DashboardCard.tsx   # 统计卡片
│   │           ├── RequestChart.tsx    # 实时请求折线图
│   │           ├── SystemStatus.tsx    # 系统状态（CPU/Mem/Disk/GPU）
│   │           └── UserCardList.tsx    # 用户卡片列表
│   │
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
└── backend/                           # SpringBoot 后端
    └── src/main/java/com/speechtrans/
        ├── controller/
        │   ├── AuthController.java         # 认证接口
        │   ├── TranslationController.java  # 翻译 + 摘要 + 删除 + 导出
        │   ├── AdminUsersController.java   # 用户管理
        │   ├── AnalyticsController.java    # 数据分析
        │   ├── MonitorController.java      # 监控数据
        │   ├── SettingsController.java     # 系统设置
        │   ├── DashboardController.java    # 仪表盘（整合所有统计数据）
        │   └── WebSocketPushController.java # WebSocket 推送
        │
        ├── service/
        │   ├── AuthService.java
        │   ├── TranslationService.java
        │   ├── SummaryService.java         # AI 摘要生成
        │   ├── HistoryService.java
        │   ├── DashboardService.java
        │   ├── AnalyticsService.java
        │   ├── MonitorService.java
        │   └── WebSocketService.java       # WebSocket 管理
        │
        ├── model/                         # Entity 类
        └── repository/                    # JPA Repository
```

---

<a id="9"></a>
## 9. 最终系统结构图

```
┌──────────────────────────────────────────────────────────────────┐
│                         Whisper AI System                         │
└──────────────────────────────────────────────────────────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         │                          │                          │
    ┌────▼─────┐             ┌──────▼──────┐            ┌─────▼─────┐
    │  Frontend │             │   Backend   │            │  Database  │
    │  (React)  │◄────HTTP───►│ (SpringBoot)│◄──────────►│  (MySQL)   │
    └────┬─────┘    WebSocket │   :8080     │            └─────┬─────┘
         │              ◄────►│             │                  │
         │                    └──────┬──────┘                  │
         │                           │                         │
    ┌────▼───────────────────────────▼─────────────────────────▼────┐
    │                      Data Flow                                 │
    │                                                                │
    │  1. 用户录音 → MediaRecorder → Blob → FormData                 │
    │  2. POST /api/translate → taskId ← return                      │
    │  3. PUT /translate/{id}/process → 触发 Whisper 转写            │
    │  4. GET /translate/{id} 轮询 → transcription + translation      │
    │  5. POST /translate/{id}/summary → AI 摘要                     │
    │  6. GET /history → 历史记录列表                                 │
    │  7. DELETE /history/{id} → 删除记录                            │
    │  8. WS /ws/monitor → 实时推送监控数据                          │
    │  9. GET /admin/dashboard → 全部真实统计数据                    │
    └────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                         Page Structure                            │
│                                                                │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   │
│  │  Login    │   │ Translate│   │ History  │   │ Settings  │   │
│  │  /login   │   │  /app    │   │/app/hist │   │/app/set   │   │
│  │  Auth     │   │  Recording│   │ 双栏布局  │   │ 主题/语言  │   │
│  │  +Reg     │   │  +AI Sum │   │+Detail   │   │ 时区/通知  │   │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘   │
│                                                                │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   │
│  │ Dashboard│   │  Users   │   │  Monitor  │   │ Analytics│   │
│  │ /admin   │   │/admin/usr│   │/admin/mon │   │/admin/ana│   │
│  │ 真实数据  │   │ 卡片列表  │   │WebSocket  │   │ 真实图表  │   │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘   │
│                                                                │
│  ┌──────────┐   ┌──────────┐                                   │
│  │  History  │   │ Settings │                                   │
│  │/admin/his│   │/admin/set│                                   │
│  │ 记录管理  │   │ 系统配置  │                                   │
│  └──────────┘   └──────────┘                                   │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    User Flow (完整闭环)                           │
│                                                                │
│  Login ──► Translate ──► Recording ──► Transcribing             │
│    │                       │                                      │
│    │                       ▼                                      │
│    │                  Translating                                  │
│    │                       │                                      │
│    │                       ▼                                      │
│    │                  Completed                                    │
│    │                   /    \                                      │
│    │                  ▼      ▼                                    │
│    │            AI Summary  Subtitle Timeline                     │
│    │                  │                                           │
│    └────► History ◄───┘                                           │
│             │                                                      │
│             ▼                                                      │
│          Detail                                                    │
│       Play Audio                                                   │
│       Download TXT                                                 │
│       Delete                                                       │
│             │                                                      │
│             └────► Translate (重新录音)                            │
│                                                                │
│  Admin:                                                         │
│  Login ──► Dashboard ──► Monitor ──► History ──► Analytics      │
│              │            (WebSocket)                            │
│              ▼                                                   │
│           Users                                                   │
│              ▼                                                   │
│           Settings                                                │
└──────────────────────────────────────────────────────────────────┘
```

---

<a id="10"></a>
## 10. 答辩演示流程

### 演示前准备

- [ ] 后端 SpringBoot 正常运行
- [ ] 前端 Vite 开发服务器正常运行
- [ ] 数据库有 10+ 条翻译记录
- [ ] 浏览器麦克风权限已授权
- [ ] 准备一段 5-10 秒的英文语音（或直接用麦克风说）
- [ ] WebSocket 服务已启动

### 演示脚本（共约 5-8 分钟）

#### Step 1: 登录（30 秒）

```
操作: 打开 /login → 输入 admin / admin123 → 点击 Log In
展示:
  - 页面设计（Forest Glass 深绿色主题）
  - Loading 动画
  - 自动跳转 Admin Dashboard
话术: "系统采用 Vision Pro 风格的 Forest Glass 设计语言，
       登录后根据角色自动跳转管理后台。"
```

#### Step 2: Dashboard 总览（60 秒）

```
操作: 展示 Dashboard 页面
展示:
  - 在线用户数（真实数据）
  - 今日翻译数量（真实数据）
  - 总翻译数量（真实数据）
  - 成功率（真实数据）
  - API 平均耗时
  - 实时请求折线图
  - 系统状态（CPU/Memory/Disk/GPU/Network/Whisper）
话术: "Dashboard 全部使用真实数据，通过后端定时采集的
       系统指标和翻译统计数据展示。"
```

#### Step 3: Monitor 实时监控（30 秒）

```
操作: 点击 Monitor → 展示 WebSocket 实时数据
展示:
  - 活跃请求列表
  - 队列统计（Queue/Processing/Finished/Failed）
  - 实时日志流
话术: "Monitor 采用 WebSocket 实现服务端推送，
       所有数据实时更新，无需手动刷新。"
```

#### Step 4: Analytics 数据分析（30 秒）

```
操作: 点击 Analytics
展示:
  - 翻译数量趋势
  - 语言分布环形图
  - 模型调用统计
  - 高峰时段分布
话术: "Analytics 所有图表均对接后端统计接口，
       展示系统的运行趋势和用户分布。"
```

#### Step 5: History 管理（30 秒）

```
操作: 点击 History
展示:
  - 按日期分组的翻译记录
  - 点击查看详情（原文/译文/播放/下载/删除）
话术: "管理端历史记录支持全文检索、播放音频、
       下载 TXT 和删除操作。"
```

#### Step 6: 切换到用户端 — Translate 核心演示（2 分钟）⭐

```
操作: Sign Out → 重新登录 user / user123 → 进入 Translate
展示:

  1. 页面设计（极简单栏布局）
     "这是用户端的翻译主页，只有一个录音球作为视觉焦点。"

  2. 语言选择
     "选择源语言 English → 目标语言 中文。"

  3. 录音翻译（核心演示！）
     - 点击录音球 → Recording（显示波形）
     - 说一段英文（或播放准备好的音频文件）
     - 自动停止 → Transcribing
     - → Translating
     - → 自动展示：原文 + 译文 + 字幕
     
  4. 文件上传（备用方案）
     "除了麦克风录音，也支持拖拽上传音频文件。"

话术: "整个翻译流程从录音到结果展示完全自动化，
       用户只需点击录音球，系统自动完成 Whisper 转写、
       翻译和展示。"
```

#### Step 7: AI Summary（30 秒）

```
操作: 点击 "Generate Summary"
展示:
  - 会议摘要
  - 关键词
  - 待办事项
  - 复制 / 导出 TXT
话术: "AI Summary 对翻译内容进行智能分析，
       一键生成摘要、关键词和待办事项。"
```

#### Step 8: 用户端 History（30 秒）

```
操作: 点击左侧 History
展示:
  - 历史记录列表（双栏布局）
  - 搜索功能
  - 点击右侧详情 → 原文/译文/Summary
  - ▶ Play Audio（播放录音）
  - 📄 Download TXT（下载文本）
  - 🗑 Delete（删除记录）
话术: "用户端历史管理支持搜索、查看详情、
       播放音频、下载和删除，形成完整闭环。"
```

#### Step 9: 技术总结（30 秒）

```
话术: "总结一下系统技术亮点：

  前端采用 React + Ant Design，组件化设计，
  录音使用 MediaRecorder API，
  实时推送基于 WebSocket，
  翻译引擎基于 OpenAI Whisper，
  后端 SpringBoot 3.3 架构清晰。

  所有功能均为真实数据，无 Mock 无占位符，
  所有流程形成完整闭环。"
```

### 答辩常见问题准备

| 问题 | 回答要点 |
|------|---------|
| 用了哪些技术栈？ | React + TypeScript, SpringBoot 3.3, MySQL, WebSocket, MediaRecorder API, OpenAI Whisper |
| 数据是真实的吗？ | 全部真实数据，Dashboard 定时采集系统指标和翻译统计 |
| 录音怎么实现的？ | 浏览器 MediaRecorder API，录制 WebM 格式，上传后端进行 Whisper 转写 |
| 实时推送怎么做的？ | WebSocket 协议，后端 Spring WebSocket 推送，前端 useWebSocket Hook 消费 |
| 做了哪些优化？ | 组件化拆分、统一 API 层、Loading/Error 统一处理、主题系统、Glass Morphism 设计 |
| 难点在哪里？ | 录音数据流管理、WebSocket 实时更新、AI 摘要生成、Dashboard 指标采集 |
| 和同类系统比优势？ | 完成度高、设计统一、全真实数据、演示流程闭环、Vision Pro 风格 UI |

---

## 附：删除清单总表

| 删除对象 | 类型 | 原因 |
|---------|------|------|
| `/app/file` 路由 | 路由 | 非核心功能，页面未实现 |
| `/app/web` 路由 | 路由 | 非核心功能，页面未实现 |
| `/app/ai` 路由 | 路由 | 非核心功能，页面未实现 |
| `/app/offline` 路由 | 路由 | 非核心功能，页面未实现 |
| `/admin/models` 路由 + 组件 | 路由+组件 | 非核心功能 |
| `Meeting Tab` | UI 元素 | 无点击事件，纯装饰 |
| `Summary Tab` | UI 元素 | 无点击事件，纯装饰 |
| `Export Tab` | UI 元素 | 无点击事件，纯装饰 |
| Google/Apple/GitHub 登录按钮 | UI 元素 | 无法在课程设计实现 |
| 右侧信息面板 (Recent/Session/Shortcuts) | UI 区域 | 数据不完整/无实际功能 |
| 底部 Dock 栏 | UI 区域 | 数据为硬编码 |
| Current Session 组件 | 组件 | 无数据来源 |
| Shortcuts 组件 | 组件 | 快捷键未绑定 |
| Thinking 状态 | 状态 | 与 Transcribing 重复 |
| Speaking 状态 | 状态 | 无实际播放音频流程 |
| Finished 状态 | 状态 | 改为 Completed |
| AdminMode 开关 | 功能 | 已由后端 role 替代 |
| Regenerate 按钮 | 功能 | 非核心，复杂度高 |
| 所有 hardcoded fallback 数据 | 数据 | 必须从 API 获取 |
| sync player 旧版本 | 组件 | 在 HistoryDetail 中重构 |
| resultCard.tsx | 组件 | 内联到 BilingualCard |

### 最终页面数量

| 端 | 页面数 | 页面列表 |
|---|--------|---------|
| 用户端 | 3 个 | Login, Translate, History |
| 管理端 | 6 个 | Dashboard, Users, Monitor, History, Analytics, Settings |
| **总计** | **9 个** | 全部可操作，全部真实数据，全部形成闭环 |

---

> **开发原则核心：** 
> 
> 宁可删功能，不留半成品。  
> 每个功能必须：可进入 → 可操作 → 有真实数据 → 流程闭环。  
> 否则直接删除，不要犹豫。
