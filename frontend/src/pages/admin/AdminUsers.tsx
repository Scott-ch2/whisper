import React, { useEffect, useState } from 'react';
import { Drawer, Descriptions } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { fetchAdminUsers } from '../../services/api';

interface UserItem { id: number; username: string; email: string; role: string; status: number; lastLogin: string; createdAt: string; }

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [selected, setSelected] = useState<UserItem | null>(null);

  useEffect(() => {
    fetchAdminUsers(1, 20).then(d => setUsers(d.records)).catch(() => {});
  }, []);

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Users</h1>
        <p className="admin-page-sub">{users.length} registered users · Card view</p>
      </div>
      <div className="user-card-list">
        {users.map(u => (
          <div key={u.id} className="user-card" onClick={() => setSelected(u)}>
            <div className="user-card-avatar"><UserOutlined /></div>
            <div className="user-card-body">
              <div className="user-card-name">{u.username}</div>
              <div className="user-card-meta">{u.email || 'No email'}</div>
            </div>
            <div className="user-card-stats" style={{ marginRight: 14 }}>
              <div className="user-card-stat-val">{u.role}</div>
              <div className="user-card-stat-lbl">Role</div>
            </div>
            <span className={`user-badge ${u.status === 1 ? 'online' : 'offline'}`}>
              {u.status === 1 ? 'Active' : 'Disabled'}
            </span>
          </div>
        ))}
      </div>
      <Drawer title={selected?.username || 'User Details'} open={!!selected} onClose={() => setSelected(null)} width={400}
        styles={{ body: { background: 'transparent', color: 'var(--ink-primary)' } }}>
        {selected && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ width: 72, height: 72, borderRadius: 20, margin: '0 auto 14px', background: 'rgba(74,222,128,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: 'var(--accent)' }}>
                <UserOutlined />
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink-primary)' }}>{selected.username}</div>
              <span className={`user-badge ${selected.status === 1 ? 'online' : 'offline'}`} style={{ marginTop: 8 }}>{selected.status === 1 ? 'Active' : 'Disabled'}</span>
            </div>
            <Descriptions column={1} size="small" colon={false}
              styles={{ label: { color: 'var(--ink-tertiary)', fontSize: 11 }, content: { color: 'var(--ink-primary)', fontSize: 13 } }}
              items={[
                { label: 'Email', children: selected.email || '—' },
                { label: 'Role', children: selected.role },
                { label: 'Status', children: selected.status === 1 ? 'Active' : 'Disabled' },
                { label: 'Last Login', children: selected.lastLogin || 'Never' },
                { label: 'Registered', children: selected.createdAt?.slice(0, 10) || '—' },
              ] as any}
            />
          </div>
        )}
      </Drawer>
    </div>
  );
};
