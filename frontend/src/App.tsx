import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthPage } from './pages/auth';
import { UserLayout, TranslationPage } from './pages/user';
import { AdminLayout, AdminDashboard, AdminUsers, AdminMonitor, AdminHistory, AdminModels, AdminAnalytics, AdminSettings } from './pages/admin';
import './styles/global.css';

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#4ADE80',
          fontFamily: 'inherit',
          colorText: '#F2F5F3',
          colorBgElevated: 'rgba(8,14,10,0.92)',
          borderRadius: 10,
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={
            <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
              <img className="fullscreen-bg-video" src="/forest.png" alt="" />
              <div className="volumetric-overlay" />
              <div className="fog-layer" />
              <div className="dark-vignette" />
              <AuthPage />
            </div>
          } />
          <Route path="/app" element={<UserLayout />}>
            <Route index element={<TranslationPage />} />
          </Route>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="monitor" element={<AdminMonitor />} />
            <Route path="history" element={<AdminHistory />} />
            <Route path="models" element={<AdminModels />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
