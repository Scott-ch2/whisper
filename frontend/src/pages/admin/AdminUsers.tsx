import React, { useEffect, useState, useCallback } from 'react';
import { Drawer, Descriptions, Modal, message } from 'antd';
import { UserOutlined, LockOutlined, UnlockOutlined, DeleteOutlined } from '@ant-design/icons';
import { fetchAdminUsers, freezeUser, unfreezeUser, deleteAdminUser } from '../../services/api';

interface UserItem { id: number; username: string; email: string; role: string; status: number; lastLogin: string; createdAt: string; }

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [selected, setSelected] = useState<UserItem | null>(null);
  const [loading, setLoading] = useState(false);

  const loadUsers = useCallback(() => {
    setLoading(true);
    fetchAdminUsers(1, 20)
      .then(d => setUsers(d.records))
      .catch(() => message.error('加载用户列表失败'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleFreeze = (user: UserItem) => {
    Modal.confirm({
      title: '冻结用户',
      content: `确定冻结用户「${user.username}」？冻结后该用户将无法登录系统。`,
      okText: '确认冻结',
      cancelText: '取消',
      okButtonProps: { danger: true },
      centered: true,
      onOk: async () => {
        try {
          await freezeUser(user.id);
          message.success(`已冻结 ${user.username}`);
          loadUsers();
        } catch { message.error('冻结失败'); }
      },
    });
  };

  const handleUnfreeze = (user: UserItem) => {
    Modal.confirm({
      title: '解冻用户',
      content: `确定解冻用户「${user.username}」？解冻后用户可以正常登录。`,
      okText: '确认解冻',
      cancelText: '取消',
      centered: true,
      onOk: async () => {
        try {
          await unfreezeUser(user.id);
          message.success(`已解冻 ${user.username}`);
          loadUsers();
        } catch { message.error('解冻失败'); }
      },
    });
  };

  const handleDelete = (user: UserItem) => {
    Modal.confirm({
      title: '删除用户',
      content: `确定删除用户「${user.username}」？此操作不可撤销，但数据仍保留在数据库中。`,
      okText: '确认删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      centered: true,
      onOk: async () => {
        try {
          await deleteAdminUser(user.id);
          message.success(`已删除 ${user.username}`);
          if (selected?.id === user.id) setSelected(null);
          loadUsers();
        } catch { message.error('删除失败'); }
      },
    });
  };

  const statusLabel = (s: number) => s === 2 ? 'FROZEN' : 'ACTIVE';
  const statusBadgeClass = (s: number) => s === 2 ? 'badge-frozen' : 'badge-active';

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Users</h1>
        <p className="admin-page-sub">{users.length} registered users · Card view</p>
      </div>
      {loading && users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--ink-tertiary)' }}>Loading users...</div>
      ) : (
        <div className="user-card-list">
          {users.map(u => (
            <div key={u.id} className="user-card" onClick={() => setSelected(u)}>
              <div className="user-card-avatar"><UserOutlined /></div>
              <div className="user-card-body">
                <div className="user-card-name">{u.username}</div>
                <div className="user-card-meta">{u.email || 'No email'}</div>
              </div>
              <div className="user-card-stats" style={{ marginRight: 4 }}>
                <div className="user-card-stat-val">{u.role}</div>
                <div className="user-card-stat-lbl">Role</div>
              </div>
              <span className={`user-badge ${statusBadgeClass(u.status)}`}>
                {statusLabel(u.status)}
              </span>
              <div className="user-card-actions" onClick={e => e.stopPropagation()}>
                {u.status === 2 ? (
                  <button className="user-action-btn unfreeze-btn" title="解冻" onClick={() => handleUnfreeze(u)}>
                    <UnlockOutlined />
                  </button>
                ) : (
                  <button className="user-action-btn freeze-btn" title="冻结" onClick={() => handleFreeze(u)}>
                    <LockOutlined />
                  </button>
                )}
                <button className="user-action-btn delete-btn" title="删除" onClick={() => handleDelete(u)}>
                  <DeleteOutlined />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Drawer
        title={selected?.username || 'User Details'}
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
                background: 'rgba(74,222,128,0.1)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 32, color: 'var(--accent)',
              }}>
                <UserOutlined />
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink-primary)' }}>{selected.username}</div>
              <span className={`user-badge ${statusBadgeClass(selected.status)}`} style={{ marginTop: 8 }}>
                {statusLabel(selected.status)}
              </span>
            </div>
            <Descriptions column={1} size="small" colon={false}
              styles={{
                label: { color: 'var(--ink-tertiary)', fontSize: 11 },
                content: { color: 'var(--ink-primary)', fontSize: 13 },
              }}
              items={[
                { label: 'Email', children: selected.email || '—' },
                { label: 'Role', children: selected.role },
                { label: 'Status', children: statusLabel(selected.status) },
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
