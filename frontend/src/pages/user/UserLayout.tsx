import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Tooltip, Dropdown, Menu } from 'antd';
import {
  AudioOutlined,
  FileTextOutlined,
  GlobalOutlined,
  RobotOutlined,
  HistoryOutlined,
  CloudDownloadOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  SoundOutlined,
  ThunderboltOutlined,
  WifiOutlined,
  SafetyCertificateOutlined,
  SwapOutlined,
  CopyOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import './UserLayout.css';

interface RecentItem { id: number; src: string; tgt: string; }

const fakeRecents: RecentItem[] = [
  { id: 1, src: 'Hello', tgt: '你好' },
  { id: 2, src: 'Good morning', tgt: '早上好' },
  { id: 3, src: 'Thank you', tgt: '谢谢' },
];

export const UserLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const userMenu = (
    <Menu theme="dark" style={{ background: 'rgba(20,20,20,0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}
      items={[
        { key: 'profile', icon: <UserOutlined />, label: '个人中心' },
        { type: 'divider' },
        { key: 'logout', danger: true, icon: <LogoutOutlined />, label: '退出登录', onClick: () => navigate('/login') },
      ]} />
  );

  const navItems = [
    { key: '/app',            icon: <AudioOutlined />,          label: '实时语音翻译' },
    { key: '/app/file',       icon: <FileTextOutlined />,       label: '文件翻译' },
    { key: '/app/web',        icon: <GlobalOutlined />,         label: '网页翻译' },
    { key: '/app/ai',         icon: <RobotOutlined />,          label: 'AI 助手' },
    { key: '/app/history',    icon: <HistoryOutlined />,        label: '历史记录' },
    { key: '/app/offline',    icon: <CloudDownloadOutlined />,  label: '离线语言包' },
  ];

  return (
    <div className="user-workspace">
      <img className="fullscreen-bg-video" src="/forest.png" alt="" style={{ opacity: 1, filter: 'none' }} />
      <div className="video-overlay" style={{ background: 'radial-gradient(circle at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 100%)' }} />

      {/* ====== 左侧悬浮胶囊导航 ====== */}
      <nav className="glass-card floating-sidebar fade-in-left">
        <div className="sidebar-top">
          <div className="brand-logo" onClick={() => navigate('/app')}>
            <span className="brand-dot" /><span className="brand-dot" /><span className="brand-dot" />
          </div>
          <div className="nav-menu">
            {navItems.map(item => (
              <Tooltip key={item.key} title={item.label} placement="right" color="rgba(20,20,20,0.9)">
                <div className={`nav-item ${isActive(item.key) ? 'active' : ''}`} onClick={() => navigate(item.key)}>
                  {item.icon}
                </div>
              </Tooltip>
            ))}
          </div>
        </div>
        <div className="sidebar-bottom">
          <Tooltip title="设置" placement="right" color="rgba(20,20,20,0.9)">
            <div className={`nav-item ${isActive('/app/settings') ? 'active' : ''}`}>
              <SettingOutlined />
            </div>
          </Tooltip>
          <Dropdown overlay={userMenu} placement="rightBottom" trigger={['click']}>
            <div className="user-avatar"><UserOutlined /></div>
          </Dropdown>
        </div>
      </nav>

      {/* ====== 中间主工作区 ====== */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* ====== 右侧信息栏 ====== */}
      <aside className="glass-card right-panel fade-in-up">
        {/* 最近翻译 */}
        <div className="panel-section">
          <div className="panel-title">最近翻译</div>
          {fakeRecents.map(r => (
            <div key={r.id} className="recent-item" onClick={() => navigate('/app')}>
              <span className="recent-src">{r.src}</span>
              <SwapOutlined style={{ fontSize: 11, color: 'var(--c-ink-faint)', margin: '0 6px' }} />
              <span className="recent-tgt">{r.tgt}</span>
            </div>
          ))}
        </div>

        {/* AI 状态 */}
        <div className="panel-section">
          <div className="panel-title">AI 当前状态</div>
          <div className="status-row"><ThunderboltOutlined /> Model <span>GPT-4</span></div>
          <div className="status-row"><SoundOutlined /> Latency <span>26ms</span></div>
          <div className="status-row"><WifiOutlined /> Network <span className="online">Online</span></div>
          <div className="status-row"><SafetyCertificateOutlined /> Confidence <span>98%</span></div>
        </div>

        {/* 语音设备 */}
        <div className="panel-section">
          <div className="panel-title">语音设备</div>
          <div className="status-row"><AudioOutlined /> Mic <span>Default</span></div>
          <div className="status-row"><SoundOutlined /> Speaker <span>Default</span></div>
        </div>

        {/* 快捷键 */}
        <div className="panel-section">
          <div className="panel-title">快捷键</div>
          <div className="kbd-row"><kbd>Space</kbd> 开始录音</div>
          <div className="kbd-row"><kbd>Ctrl+T</kbd> 开始翻译</div>
          <div className="kbd-row"><kbd>Ctrl+H</kbd> 打开历史</div>
          <div className="kbd-row"><kbd>Ctrl+E</kbd> 导出结果</div>
        </div>
      </aside>
    </div>
  );
};
