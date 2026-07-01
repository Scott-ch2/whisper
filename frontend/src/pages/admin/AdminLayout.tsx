import React, { useMemo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Tooltip, Dropdown } from 'antd';
import {
  UserOutlined, SettingOutlined, LogoutOutlined,
  DashboardOutlined, TeamOutlined, TranslationOutlined,
  HistoryOutlined, RobotOutlined, BarChartOutlined,
  ControlOutlined,
} from '@ant-design/icons';
import { clearToken } from '../../services/api';
import './AdminLayout.css';

const adminNav = [
  { key: '/admin',              icon: <DashboardOutlined />,     label: 'Dashboard' },
  { key: '/admin/users',        icon: <TeamOutlined />,          label: 'Users' },
  { key: '/admin/monitor',      icon: <TranslationOutlined />,   label: 'Monitor' },
  { key: '/admin/history',      icon: <HistoryOutlined />,       label: 'History' },
  { key: '/admin/models',       icon: <RobotOutlined />,         label: 'Models' },
  { key: '/admin/analytics',    icon: <BarChartOutlined />,      label: 'Analytics' },
  { key: '/admin/settings',     icon: <ControlOutlined />,       label: 'Settings' },
];

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const userMenuItems = useMemo(() => [
    { key: 'profile', icon: <UserOutlined />, label: 'Profile' },
    { type: 'divider' as const },
    { key: 'logout', danger: true, icon: <LogoutOutlined />, label: 'Sign Out', onClick: () => { clearToken(); navigate('/login'); } },
  ], [navigate]);

  return (
    <div className="admin-workspace">
      {/* Background — dimmer than user side */}
      <img className="fullscreen-bg-video" src="/forest.png" alt="" style={{ filter: 'brightness(0.55) saturate(0.6) contrast(1.1)' }} />
      <div className="volumetric-overlay" style={{ opacity: 0.4 }} />
      <div className="dark-vignette" style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0.7) 100%)' }} />

      {/* Left Sidebar */}
      <nav className="glass-card admin-sidebar fade-in-left">
        <div className="admin-logo" onClick={() => navigate('/admin')}>
          <span className="admin-logo-dot" /><span className="admin-logo-dot" /><span className="admin-logo-dot" />
        </div>
        <div className="admin-nav">
          {adminNav.map(item => (
            <Tooltip key={item.key} title={item.label} placement="right" color="rgba(8,14,10,0.96)">
              <div className={`admin-nav-item ${isActive(item.key) ? 'active' : ''}`} onClick={() => navigate(item.key)}>
                {item.icon}
              </div>
            </Tooltip>
          ))}
        </div>
        <div className="admin-sidebar-bottom">
          <Dropdown menu={{ theme: 'dark', items: userMenuItems }} placement="rightBottom" trigger={['click']}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              fontSize: 16, color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
              transition: 'all 0.25s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 16px var(--accent-glow-soft)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <UserOutlined />
            </div>
          </Dropdown>
        </div>
      </nav>

      {/* Content */}
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};
