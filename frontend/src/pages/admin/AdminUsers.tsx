import React, { useState } from 'react';
import { Drawer, Descriptions, Tag } from 'antd';
import { UserOutlined, TranslationOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';

interface User { id: number; name: string; tasks: number; accuracy: string; online: boolean; }

const USERS: User[] = [
  { id: 1, name: 'Alice Chen',     tasks: 14, accuracy: '98.2%', online: true },
  { id: 2, name: 'Bob Wang',       tasks: 8,  accuracy: '95.6%', online: false },
  { id: 3, name: 'Carol Zhang',    tasks: 22, accuracy: '99.1%', online: true },
  { id: 4, name: 'David Liu',      tasks: 5,  accuracy: '92.3%', online: true },
  { id: 5, name: 'Eva Wu',         tasks: 16, accuracy: '97.8%', online: false },
  { id: 6, name: 'Frank Li',       tasks: 11, accuracy: '94.5%', online: true },
];

export const AdminUsers: React.FC = () => {
  const [selected, setSelected] = useState<User | null>(null);

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Users</h1>
        <p className="admin-page-sub">{USERS.length} registered users · Card view</p>
      </div>

      <div className="user-card-list">
        {USERS.map(u => (
          <div key={u.id} className="user-card" onClick={() => setSelected(u)}>
            <div className="user-card-avatar"><UserOutlined /></div>
            <div className="user-card-body">
              <div className="user-card-name">{u.name}</div>
              <div className="user-card-meta">Today {u.tasks} tasks</div>
            </div>
            <div className="user-card-stats" style={{ marginRight: 14 }}>
              <div className="user-card-stat-val">{u.accuracy}</div>
              <div className="user-card-stat-lbl">Accuracy</div>
            </div>
            <span className={`user-badge ${u.online ? 'online' : 'offline'}`}>
              {u.online ? 'Online' : 'Offline'}
            </span>
          </div>
        ))}
      </div>

      <Drawer
        title={selected?.name || 'User Details'}
        open={!!selected}
        onClose={() => setSelected(null)}
        width={400}
        styles={{ body: { background: 'transparent', color: 'var(--ink-primary)' } }}
      >
        {selected && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{
                width: 72, height: 72, borderRadius: 20, margin: '0 auto 14px',
                background: 'rgba(74,222,128,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, color: 'var(--accent)',
              }}>
                <UserOutlined />
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink-primary)' }}>{selected.name}</div>
              <span className={`user-badge ${selected.online ? 'online' : 'offline'}`} style={{ marginTop: 8 }}>
                {selected.online ? 'Online' : 'Offline'}
              </span>
            </div>
            <Descriptions column={1} size="small" colon={false}
              styles={{ label: { color: 'var(--ink-tertiary)', fontSize: 11 }, content: { color: 'var(--ink-primary)', fontSize: 13 } }}
              items={[
                { label: 'Today Tasks', children: selected.tasks },
                { label: 'Accuracy', children: selected.accuracy },
                { label: 'Total Translations', children: '348' },
                { label: 'Avg Latency', children: '24ms' },
                { label: 'Device', children: 'MacBook Pro · Chrome' },
              ] as any}
            />
          </div>
        )}
      </Drawer>
    </div>
  );
};
