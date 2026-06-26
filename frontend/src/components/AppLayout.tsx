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
      <header className="glass-card" style={{
        height: 80, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', position: 'sticky', top: 0, zIndex: 100, borderRadius: 0,
        borderTop: 'none', borderLeft: 'none', borderRight: 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: 32, height: 32, background: 'var(--color-primary-cyan)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
            <AudioOutlined />
          </div>
          <h2 style={{ margin: 0, fontSize: 20, color: 'var(--color-primary-dark)' }}>语音翻译系统</h2>
        </div>

        {location.pathname !== '/login' && (
          <Dropdown overlay={menu} placement="bottomRight">
            <Avatar style={{ backgroundColor: 'var(--color-primary-dark)', cursor: 'pointer' }} icon={<UserOutlined />} />
          </Dropdown>
        )}
      </header>

      <main style={{ padding: '40px 20px', minHeight: 'calc(100vh - 80px)' }}>
        <Outlet />
      </main>
    </>
  );
};
