import React, { useMemo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Tooltip, Dropdown } from 'antd';
import {
  UserOutlined, LogoutOutlined,
  AudioOutlined, HistoryOutlined,
} from '@ant-design/icons';
import { clearToken } from '../../services/api';
import './UserLayout.css';

/* ── Forest Particles ────────────────────────────────────────────────────── */
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

export const UserLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const userMenuItems = useMemo(() => [
    { key: 'profile', icon: <UserOutlined />, label: 'Profile', onClick: () => navigate('/app/profile') },
    { type: 'divider' as const },
    { key: 'logout', danger: true, icon: <LogoutOutlined />, label: 'Sign Out', onClick: () => { clearToken(); navigate('/login'); } },
  ], [navigate]);

  const navItems = useMemo(() => [
    { key: '/app',         icon: <AudioOutlined />,    label: 'Translate' },
    { key: '/app/history', icon: <HistoryOutlined />,  label: 'History' },
  ], []);

  return (
    <div className="user-workspace">
      <img className="fullscreen-bg-video" src="/forest.png" alt="" />
      <div className="volumetric-overlay" />
      <div className="fog-layer" />
      <div className="dof-overlay" />
      <div className="dark-vignette" />
      <ForestParticles />

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
          <Dropdown menu={{ theme: 'dark', items: userMenuItems }} placement="rightBottom" trigger={['click']}>
            <div className="user-avatar"><UserOutlined /></div>
          </Dropdown>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};
