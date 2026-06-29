# whisper 前端项目

## 目录结构
```
src/
├── components/       # 全局公共组件
│   ├── WaveCircle.tsx      # 暗态毛玻璃录音灵石
│   ├── ResultCard.tsx      # 暗黑翻译结果卡
│   ├── SyncPlayer.tsx      # 滚动歌词播放器
│   └── DragUpload.tsx      # 拖拽上传
├── pages/
│   ├── auth/               # 🚪 登录与注册
│   │   ├── AuthPage.tsx
│   │   └── AuthPage.css
│   ├── user/               # 🧑‍💻 用户工作台
│   │   ├── UserLayout.tsx  # 悬浮胶囊侧边栏
│   │   ├── TranslationPage.tsx
│   │   └── HistoryPage.tsx
│   └── admin/              # 👨‍🔧 管理员控制台
│       ├── AdminLayout.tsx
│       └── AdminDashboard.tsx
├── styles/  global.css     # 暗夜森林设计令牌 + 毛玻璃
├── hooks/   useRecorder.ts
├── services/               # API 接口骨架
├── App.tsx                 # 三端路由分发中心
└── main.tsx               # 入口
```

## 启动
```bash
npm install
npm run dev
```

## 路由
- `/login` — 登录页
- `/app` — 用户工作台
- `/admin` — 管理员控制台 (预留)

## 技术栈
- React 19 + TypeScript
- Ant Design 6 + @ant-design/icons
- React Router 7
- Vite
