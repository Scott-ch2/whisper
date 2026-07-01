import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthPage } from './pages/auth';
import { UserLayout, TranslationPage, HistoryPage, ProfilePage } from './pages/user';
import { AdminLayout, AdminDashboard, AdminUsers, AdminRecords, AdminProfilePage } from './pages/admin';
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
          <Route path="/login" element={<AuthPage />} />
          <Route path="/app" element={<UserLayout />}>
            <Route index element={<TranslationPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="records" element={<AdminRecords />} />
            <Route path="profile" element={<AdminProfilePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
