import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AppLayout } from './components/AppLayout';
import { TranslationPage } from './pages/TranslationPage';
// import { AuthPage } from './pages/AuthPage';
// import { HistoryPage } from './pages/HistoryPage';
import './styles/global.css';

const App: React.FC = () => {
  return (
    <ConfigProvider theme={{
      token: {
        colorPrimary: '#0a2540',
        colorInfo: '#00c2ff',
        colorSuccess: '#00e5a0',
        fontFamily: 'inherit',
      }
    }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<TranslationPage />} />
            {/* 暂时注释掉还没写的页面，防止报错 */}
            {/* <Route path="login" element={<AuthPage />} /> */}
            {/* <Route path="history" element={<HistoryPage />} /> */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;