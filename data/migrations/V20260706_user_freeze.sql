-- ========================================
-- Migration: User Freeze & Soft Delete
-- Date: 2026-07-06
-- ========================================

-- 1. Add deleted column for soft delete
ALTER TABLE sys_user
    ADD COLUMN deleted INT DEFAULT 0 COMMENT '逻辑删除(0=未删除, 1=已删除)'
    AFTER updated_at;

-- 2. Migrate existing status values:
--    Old: 0=disabled, 1=active
--    New: 1=ACTIVE, 2=FROZEN
UPDATE sys_user SET status = 2 WHERE status = 0;
