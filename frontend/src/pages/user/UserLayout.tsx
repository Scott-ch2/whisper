import React, { useState, useMemo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Tooltip, Dropdown } from 'antd';
import {
  UserOutlined, SettingOutlined, LogoutOutlined,
  DownOutlined, SwapOutlined,
  AudioOutlined, FileTextOutlined, GlobalOutlined,
  HistoryOutlined, CloudDownloadOutlined,
  ClockCircleOutlined, CheckCircleOutlined, TranslationOutlined,
  ThunderboltOutlined,
  RightOutlined,
  FileOutlined,
} from '@ant-design/icons';
import './UserLayout.css';

/* ── Particles ──────────────────────────────────────────────────────────── */
const FOREST_PARTICLES = Array.from({ length: 32 }, (_, i) => {
  const isFirefly = i < 12;
  return {
    id: i, isFirefly,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 24}s`,
    duration: `${isFirefly ? 8 + Math.random() * 16 : 14 + Math.random() * 22}s`,
    size: isFirefly ? `${2 + Math.random() * 3}px` : `${1.2 + Math.random() * 2}px`,
  };
});
const ForestParticles: React.FC = React.memo(() => (
  <div className="forest-particles" aria-hidden="true">
    {FOREST_PARTICLES.map(p => (
      <div key={p.id} className={`forest-particle ${p.isFirefly ? 'firefly' : ''}`}
        style={{ left: p.left, bottom: '-4%', width: p.size, height: p.size, animationDelay: p.delay, animationDuration: p.duration }} />
    ))}
  </div>
));

/* ── Data ────────────────────────────────────────────────────────────────── */
interface RecentItem { id: number; src: string; tgt: string; time: string; }
const fakeRecents: RecentItem[] = [
  { id: 1, src: 'Hello, how are you?', tgt: '你好，你怎么样？', time: '2m ago' },
  { id: 2, src: 'Good morning everyone', tgt: '大家早上好', time: '15m ago' },
  { id: 3, src: 'Thank you very much', tgt: '非常感谢', time: '1h ago' },
  { id: 4, src: 'See you tomorrow', tgt: '明天见', time: '2h ago' },
];
const recentFiles = [
  { name: 'Meeting.mp3', size: '12.4 MB', time: 'Today' },
  { name: 'Interview.wav', size: '34.1 MB', time: 'Yesterday' },
  { name: 'Podcast.mp3', size: '8.7 MB', time: '2d ago' },
];

/* ═════════════════════════════════════════════════════════════════════════════
   USER LAYOUT
   ═════════════════════════════════════════════════════════════════════════════ */
export const UserLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const userMenuItems = useMemo(() => [
    { key: 'profile', icon: <UserOutlined />, label: 'Profile' },
    { type: 'divider' as const },
    { key: 'logout', danger: true, icon: <LogoutOutlined />, label: 'Sign Out', onClick: () => navigate('/login') },
  ], [navigate]);

  const navItems = useMemo(() => [
    { key: '/app',         icon: <AudioOutlined />,          label: 'Translate' },
    { key: '/app/file',    icon: <FileTextOutlined />,       label: 'Document' },
    { key: '/app/web',     icon: <GlobalOutlined />,         label: 'Browser' },
    { key: '/app/ai',      icon: <ThunderboltOutlined />,    label: 'Assistant' },
    { key: '/app/history', icon: <HistoryOutlined />,        label: 'History' },
    { key: '/app/offline', icon: <CloudDownloadOutlined />,  label: 'Offline' },
  ], []);

  return (
    <div className="user-workspace">
      {/* Background layers */}
      <img className="fullscreen-bg-video" src="/forest.png" alt="" />
      <div className="volumetric-overlay" />
      <div className="fog-layer" />
      <div className="dof-overlay" />
      <div className="dark-vignette" />
      <ForestParticles />

      {/* ════ Left — Expandable Pill Sidebar ════ */}
      <nav className="glass-card floating-sidebar fade-in-left">
        <div className="sidebar-top">
          <div className="brand-logo" onClick={() => navigate('/app')}>
            <span className="brand-dot" /><span className="brand-dot" /><span className="brand-dot" />
          </div>
          <div className="nav-menu">
            {navItems.map(item => (
              <Tooltip key={item.key} title={item.label} placement="right" color="rgba(7,12,9,0.94)">
                <div className={`nav-item ${isActive(item.key) ? 'active' : ''}`} onClick={() => navigate(item.key)}>
                  <span className="nav-icon-wrap">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </div>
              </Tooltip>
            ))}
          </div>
        </div>
        <div className="sidebar-bottom">
          <Tooltip title="Settings" placement="right" color="rgba(7,12,9,0.94)">
            <div className={`nav-item ${isActive('/app/settings') ? 'active' : ''}`}>
              <span className="nav-icon-wrap"><SettingOutlined /></span>
              <span className="nav-label">Settings</span>
            </div>
          </Tooltip>
          <Dropdown menu={{ theme: 'dark', items: userMenuItems }} placement="rightBottom" trigger={['click']}>
            <div className="user-avatar"><UserOutlined /></div>
          </Dropdown>
        </div>
      </nav>

      {/* ════ Center ════ */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* ════ Right — User-Facing Panel ════ */}
      <aside className="right-panel fade-in-up">
        {/* Recent — Linear style */}
        <div className="panel-section">
          <div className="panel-title">Recent</div>
          {fakeRecents.map(r => (
            <div key={r.id} className="recent-item" onClick={() => navigate('/app')}>
              <div className="recent-main">
                <span className="recent-src">{r.src}</span>
                <SwapOutlined style={{ fontSize: 9, color: 'var(--ink-tertiary)', flexShrink: 0 }} />
                <span className="recent-tgt">{r.tgt}</span>
              </div>
              <div className="recent-time">{r.time}</div>
              <span className="recent-arrow"><RightOutlined /></span>
            </div>
          ))}
        </div>

        {/* Current Session — unified card */}
        <div className="panel-section">
          <div className="panel-title">Current Session</div>
          <div className="session-card">
            <div className="session-stat">
              <div className="session-stat-icon"><TranslationOutlined /></div>
              <div className="session-stat-body">
                <div className="session-stat-label">Language Pair</div>
                <div className="session-stat-value">CN ↔ EN</div>
              </div>
            </div>
            <div className="session-stat">
              <div className="session-stat-icon"><ClockCircleOutlined /></div>
              <div className="session-stat-body">
                <div className="session-stat-label">Duration</div>
                <div className="session-stat-value">12m 34s</div>
              </div>
            </div>
            <div className="session-stat">
              <div className="session-stat-icon"><CheckCircleOutlined /></div>
              <div className="session-stat-body">
                <div className="session-stat-label">Accuracy</div>
                <div className="session-stat-value">98.2%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Files */}
        <div className="panel-section">
          <div className="panel-title">Recent Files</div>
          {recentFiles.map(f => (
            <div key={f.name} className="recent-item" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FileOutlined style={{ fontSize: 14, color: 'var(--ink-tertiary)' }} />
                <div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-primary)', fontWeight: 500 }}>{f.name}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--ink-tertiary)', marginTop: 1 }}>{f.size} · {f.time}</div>
                </div>
              </div>
              <span className="recent-arrow"><RightOutlined /></span>
            </div>
          ))}
        </div>

        {/* Shortcuts */}
        <div className="panel-section panel-shortcuts">
          <div className="panel-title shortcuts-header" onClick={() => setShortcutsOpen(!shortcutsOpen)}>
            <span>Shortcuts</span>
            <DownOutlined className={`shortcuts-chevron ${shortcutsOpen ? 'open' : ''}`} />
          </div>
          <div className={`shortcuts-body ${shortcutsOpen ? 'open' : ''}`}>
            <div className="kbd-row"><kbd>Space</kbd> Start Recording</div>
            <div className="kbd-row"><kbd>⌘T</kbd> Translate</div>
            <div className="kbd-row"><kbd>⌘H</kbd> History</div>
            <div className="kbd-row"><kbd>⌘E</kbd> Export</div>
          </div>
        </div>
      </aside>
    </div>
  );
};
