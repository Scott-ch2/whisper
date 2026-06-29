import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthPage } from './pages/auth';
import { UserLayout } from './pages/user';
import { TranslationPage } from './pages/user';
import './styles/global.css';

const App: React.FC = () => {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#4ADE80', fontFamily: 'inherit', colorText: '#ffffff' } }}>
      <BrowserRouter>
        <Routes>
          {/* 登录页配置 */}
          <Route path="/login" element={
            <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
              <img className="fullscreen-bg-video" src="/forest.png" alt="" style={{ opacity: 1, filter: 'none', objectFit: 'cover' }} />
              <div className="video-overlay" style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                background: 'radial-gradient(circle at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.25) 100%)',
                backdropFilter: 'none'
              }}></div>
              <AuthPage />
            </div>
          } />

          <Route path="/app" element={<UserLayout />}>
            <Route index element={<TranslationPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
