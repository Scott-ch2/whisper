import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AudioOutlined } from '@ant-design/icons';

export const AppLayout: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* 全屏森林视频背景 */}
      <video
        className="fullscreen-bg-video"
        autoPlay loop muted playsInline
      >
        <source src="/bg-forest.mp4" type="video/mp4" />
      </video>

      {/* 暗色叠加层 */}
      <div className="video-overlay" />

      {/* 导航栏 */}
      <header className="nav-bar">
        <div className="nav-logo" onClick={() => navigate('/')}>
          <div className="nav-logo-icon">
            <AudioOutlined style={{ fontSize: 13 }} />
          </div>
          <span className="nav-logo-text">语音翻译</span>
        </div>
      </header>

      {/* 主内容 */}
      <main className="page-main">
        <Outlet />
      </main>
    </>
  );
};
