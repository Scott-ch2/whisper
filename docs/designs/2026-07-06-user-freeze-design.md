# 管理员用户冻结功能设计

## 背景
为管理员用户管理模块增加用户冻结功能，支持 ACTIVE / FROZEN 两种状态，配合软删除实现完整的用户管理能力。

## 后端改动

### 1. User 实体
- `status` 语义调整：1=ACTIVE, 2=FROZEN（旧 0=禁用 已废弃）
- 新增 `deleted` 字段（Integer），配合 MyBatis-Plus 逻辑删除（`logic-delete-field: deleted`）

### 2. API 端点（AdminUsersController）
| 方法 | 路径 | 说明 |
|------|------|------|
| PUT | `/api/admin/users/{id}/freeze` | 冻结用户，status=2 |
| PUT | `/api/admin/users/{id}/unfreeze` | 解冻用户，status=1 |
| DELETE | `/api/admin/users/{id}` | 软删除用户，deleted=1 |

### 3. 登录校验（AuthController.login）
- 检查 `status == 2` → 返回 403 "账号已被冻结"

### 4. 列表查询
- 现有 GET /api/admin/users 已含 status 字段
- MP 逻辑删除自动排除 deleted=1 记录

## 前端改动

### AdminUsers 组件
- 保留卡片布局，增强每个卡片
- Status 列：ACTIVE 绿色徽标 / FROZEN 橙色徽标
- Freeze/Unfreeze 按钮：根据状态显示其一
- Delete 按钮：红色警示，与 Freeze 明显区分
- 确认弹窗：每次操作前弹出 Modal 确认

### UI 风格
- 延续现有 Dark Glass 风格（CSS 变量：--accent, --glass-bg-card, --glass-border 等）

## 数据流
冻结/解冻 → PUT API → 更新 DB → 刷新列表
删除 → DELETE API → MP 逻辑删除 → 刷新列表
登录 → 校验 status → FROZEN 拒绝登录
