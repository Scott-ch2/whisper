import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Dropdown, Avatar } from 'antd';
import { UserOutlined, HistoryOutlined, AudioOutlined } from '@ant-design/icons';

export const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menu = (
    <Menu items={[
      { key: 'history', icon: <HistoryOutlined />, label: '历史记录', onClick: () => navigate('/history') },
      { key: 'logout', danger: true, label: '退出登录', onClick: () => navigate('/login') },
    ]} />
  );

  return (
    <>
      {/* 🚀 新增：全屏背景视频 */}
      <video
        className="fullscreen-bg-video"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/bg-forest.mp4" type="video/mp4" />
      </video>

      {/* 🚀 新增：视频遮罩层（防止视频太亮导致看不清文字） */}
      <div className="video-overlay"></div>

      {/* 导航栏 */}
      <header className="glass-card main-header" style={{
        height: 80, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', position: 'sticky', top: 0, zIndex: 100, borderRadius: 0,
        borderTop: 'none', borderLeft: 'none', borderRight: 'none',
        background: 'rgba(255, 255, 255, 0.4)' // 导航栏更透明一些
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: 32, height: 32, background: 'var(--color-primary-cyan)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', boxShadow: '0 0 10px rgba(0,194,255,0.5)' }}>
            <AudioOutlined />
          </div>