# User Freeze Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development or executing-plans to implement this plan task-by-task.

**Goal:** Add user freeze/unfreeze and soft-delete capabilities to the admin user management module.

**Architecture:** Backend adds `deleted` field to User entity + two new freeze/unfreeze endpoints + modifies login check. Frontend enhances card-based AdminUsers component with Status badges, Freeze/Unfreeze/Delete action buttons. Soft delete uses MyBatis-Plus logic delete (already configured globally).

**Tech Stack:** SpringBoot + MyBatis-Plus (Java), React + Ant Design + TypeScript (frontend)

---

## Files to Modify

| File | Change |
|------|--------|
| `backend/.../entity/User.java` | Add `deleted` field |
| `backend/.../controller/AdminUsersController.java` | Add freeze, unfreeze, delete endpoints |
| `backend/.../controller/AuthController.java` | Update login status check (0→2) |
| `frontend/src/services/api.ts` | Add freezeUser, unfreezeUser, deleteUser API functions |
| `frontend/src/pages/admin/AdminUsers.tsx` | Full rewrite with Status badge, action buttons, confirm modals |

---

## Task 1: Add `deleted` field to User entity

**File:** `backend/src/main/java/com/speechtrans/entity/User.java`

Add the `deleted` field after `updatedAt`:

```java
    private LocalDateTime updatedAt;
    @TableLogic
    private Integer deleted;
```

Import `@TableLogic` is already covered by `import com.baomidou.mybatisplus.annotation.*;`.

**Steps:**
1. Open `User.java`, add `@TableLogic private Integer deleted;` after `updatedAt`
2. Verify the import `com.baomidou.mybatisplus.annotation.*` already covers `@TableLogic`

---

## Task 2: Add freeze/unfreeze/delete API endpoints

**File:** `backend/src/main/java/com/speechtrans/controller/AdminUsersController.java`

Add three new endpoints after the existing `toggleUserStatus` method (after line 84).

```java
    @PutMapping("/users/{id}/freeze")
    public Result<String> freezeUser(@PathVariable Long id) {
        User user = userMapper.selectById(id);
        if (user == null) {
            return Result.error(404, "用户不存在");
        }
        user.setStatus(2);
        userMapper.updateById(user);
        return Result.success("用户已冻结");
    }

    @PutMapping("/users/{id}/unfreeze")
    public Result<String> unfreezeUser(@PathVariable Long id) {
        User user = userMapper.selectById(id);
        if (user == null) {
            return Result.error(404, "用户不存在");
        }
        user.setStatus(1);
        userMapper.updateById(user);
        return Result.success("用户已解冻");
    }

    @DeleteMapping("/users/{id}")
    public Result<String> deleteUser(@PathVariable Long id) {
        User user = userMapper.selectById(id);
        if (user == null) {
            return Result.error(404, "用户不存在");
        }
        userMapper.deleteById(id);  // MyBatis-Plus logic delete (deleted=1)
        return Result.success("用户已删除");
    }
```

**Steps:**
1. Open `AdminUsersController.java`
2. Add the three endpoint methods after line 84 (after the closing brace of `toggleUserStatus`)
3. Verify no duplicate imports needed (all are already imported)

---

## Task 3: Update login status check

**File:** `backend/src/main/java/com/speechtrans/controller/AuthController.java`

Change the status check in the `login` method (currently checks `status == 0`).

Current code (line 35-37):
```java
        if (user.getStatus() == 0) {
            return Result.error(403, "账号已被禁用");
        }
```

Change to:
```java
        if (user.getStatus() == 2) {
            return Result.error(403, "账号已被冻结");
        }
```

**Steps:**
1. Open `AuthController.java`
2. Replace `user.getStatus() == 0` with `user.getStatus() == 2`
3. Replace message "账号已被禁用" with "账号已被冻结"

---

## Task 4: Add frontend API functions

**File:** `frontend/src/services/api.ts`

Add three new API functions at the end of the Admin section (after line 286).

```typescript
export async function freezeUser(id: number): Promise<string> {
  return request<string>(`/admin/users/${id}/freeze`, { method: 'PUT' });
}

export async function unfreezeUser(id: number): Promise<string> {
  return request<string>(`/admin/users/${id}/unfreeze`, { method: 'PUT' });
}

export async function deleteAdminUser(id: number): Promise<string> {
  return request<string>(`/admin/users/${id}`, { method: 'DELETE' });
}
```

**Steps:**
1. Open `api.ts`
2. Append the three functions after the `updateSettings` function (after line 286)

---

## Task 5: Rewrite AdminUsers component with Freeze/Unfreeze/Delete support

**File:** `frontend/src/pages/admin/AdminUsers.tsx`

Full component replacement. The new component:
- Uses card layout (same visual style)
- Shows Status badge (ACTIVE=FROZEN)
- Shows action buttons (Freeze/Unfreeze + Delete) per card
- Uses Modal.confirm for confirmation dialogs
- Auto-refreshes list after any operation

```tsx
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
```

---

## Task 6: Add CSS styles for new badges and action buttons

**File:** `frontend/src/styles/global.css`

Append these styles at the end of the file (before the closing, around line 480).

```css
/* ── User Freeze Styles ───────────────────────────────────────────── */
.badge-frozen {
  background: rgba(255, 159, 28, 0.15) !important;
  color: #FF9F1C !important;
  border-color: rgba(255, 159, 28, 0.3) !important;
}

.user-card-actions {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-right: 12px;
}

.user-action-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: var(--ink-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.22s var(--ease-out-expo);
}

.user-action-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  box-shadow: 0 0 12px var(--accent-glow-soft);
}

.user-action-btn.freeze-btn:hover {
  border-color: #FF9F1C;
  color: #FF9F1C;
  box-shadow: 0 0 12px rgba(255, 159, 28, 0.25);
}

.user-action-btn.unfreeze-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  box-shadow: 0 0 12px var(--accent-glow-soft);
}

.user-action-btn.delete-btn:hover {
  border-color: #FF4D4F;
  color: #FF4D4F;
  box-shadow: 0 0 12px rgba(255, 77, 79, 0.25);
}
```

---

## Task 7: Database migration (SQL)

Run this SQL against the MySQL database to add the `deleted` column to `sys_user` table and update existing status values:

```sql
-- Add deleted column for soft delete
ALTER TABLE sys_user ADD COLUMN deleted INT DEFAULT 0 COMMENT '逻辑删除(0=未删除, 1=已删除)';

-- Migrate existing status: 0→2 (disabled→frozen), 1 stays 1 (active)
UPDATE sys_user SET status = 2 WHERE status = 0;
```

---

## Verification Steps

1. **Backend compile check:** Run `mvn compile` in the backend directory
2. **Frontend build check:** Run `npm run build` or `npx vite build` in frontend directory
3. **API test (freeze):** `curl -X PUT http://localhost:8088/api/admin/users/1/freeze`
4. **API test (unfreeze):** `curl -X PUT http://localhost:8088/api/admin/users/1/unfreeze`
5. **API test (delete):** `curl -X DELETE http://localhost:8088/api/admin/users/1`
6. **API test (login blocked):** Try logging in with a FROZEN user — expect 403 "账号已被冻结"
7. **UI test:** Open admin users page — verify Status badges, action buttons, confirmation modals, auto-refresh
