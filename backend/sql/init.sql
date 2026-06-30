-- ============================================================
-- Whisper — Speech Translation System
-- Database Schema v1.0
-- ============================================================

CREATE DATABASE IF NOT EXISTS speech_translate
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE speech_translate;

-- ============================================================
-- 1. sys_user — 系统用户表
-- ============================================================
DROP TABLE IF EXISTS sys_user;
CREATE TABLE sys_user (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  username    VARCHAR(50)  NOT NULL UNIQUE COMMENT '用户名',
  password    VARCHAR(255) NOT NULL COMMENT '密码(BCrypt加密)',
  email       VARCHAR(100) COMMENT '邮箱',
  avatar      VARCHAR(255) COMMENT '头像URL',
  role        VARCHAR(20)  NOT NULL DEFAULT 'USER' COMMENT '角色: USER/ADMIN',
  status      TINYINT      NOT NULL DEFAULT 1 COMMENT '状态: 1-正常 0-禁用',
  last_login  DATETIME     COMMENT '最后登录时间',
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户表';

-- ============================================================
-- 2. translation_task — 翻译任务表
-- ============================================================
DROP TABLE IF EXISTS translation_task;
CREATE TABLE translation_task (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id         BIGINT       NOT NULL COMMENT '用户ID',
  audio_file_name VARCHAR(255) NOT NULL COMMENT '原始音频文件名',
  audio_file_path VARCHAR(500) NOT NULL COMMENT '音频文件存储路径',
  audio_duration  FLOAT        COMMENT '音频时长(秒)',
  src_lang        VARCHAR(10)  COMMENT '源语言代码',
  tgt_lang        VARCHAR(10)  NOT NULL COMMENT '目标语言代码',
  detected_lang   VARCHAR(10)  COMMENT '检测到的语言(自动模式)',
  transcription   MEDIUMTEXT   COMMENT '语音识别原文',
  translation     MEDIUMTEXT   COMMENT '翻译结果',
  segments_json   MEDIUMTEXT   COMMENT '分段详情(JSON)',
  status          ENUM('pending','processing','completed','failed')
                  NOT NULL DEFAULT 'pending' COMMENT '任务状态',
  error_message   VARCHAR(500) COMMENT '错误信息',
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  CONSTRAINT fk_task_user FOREIGN KEY (user_id) REFERENCES sys_user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='翻译任务表';

-- ============================================================
-- 3. translation_segment — 分段翻译详情
-- ============================================================
DROP TABLE IF EXISTS translation_segment;
CREATE TABLE translation_segment (
  id           BIGINT PRIMARY KEY AUTO_INCREMENT,
  task_id      BIGINT       NOT NULL COMMENT '关联任务ID',
  seq          INT          NOT NULL COMMENT '分段序号',
  start_time   FLOAT        NOT NULL COMMENT '开始时间(秒)',
  end_time     FLOAT        NOT NULL COMMENT '结束时间(秒)',
  source_text  TEXT         NOT NULL COMMENT '源语言文本',
  target_text  TEXT         COMMENT '翻译文本',
  confidence   FLOAT        COMMENT '识别置信度',
  INDEX idx_task_id (task_id),
  CONSTRAINT fk_seg_task FOREIGN KEY (task_id) REFERENCES translation_task(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分段翻译详情';

-- ============================================================
-- 4. system_log — 系统日志
-- ============================================================
DROP TABLE IF EXISTS system_log;
CREATE TABLE system_log (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id     BIGINT       COMMENT '操作用户ID',
  action      VARCHAR(50)  NOT NULL COMMENT '操作类型: translate/login/register/export',
  target_id   BIGINT       COMMENT '操作对象ID',
  detail      VARCHAR(500) COMMENT '详细信息',
  ip          VARCHAR(45)  COMMENT 'IP地址',
  user_agent  VARCHAR(512) COMMENT 'User Agent',
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统日志';

-- ============================================================
-- 5. model_config — AI 模型配置
-- ============================================================
DROP TABLE IF EXISTS model_config;
CREATE TABLE model_config (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  model_name    VARCHAR(100) NOT NULL UNIQUE COMMENT '模型名称: whisper-turbo/gpt-4/opus-mt',
  model_type    VARCHAR(50)  NOT NULL COMMENT '类型: asr/nmt/llm',
  is_enabled    TINYINT      NOT NULL DEFAULT 1 COMMENT '是否启用',
  config_json   TEXT         COMMENT '配置(JSON): API Key/温度/速率限制等',
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI模型配置';

-- ============================================================
-- 初始化数据
-- ============================================================

-- 管理员 (BCrypt: admin123)
INSERT INTO sys_user (username, password, email, role, status) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5Eh', 'admin@whisper.io', 'ADMIN', 1);

-- 测试用户 (BCrypt: user123)
INSERT INTO sys_user (username, password, email, role, status) VALUES
('user',  '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5Eh', 'user@whisper.io',  'USER',  1);

-- 模型配置
INSERT INTO model_config (model_name, model_type, is_enabled, config_json) VALUES
('whisper-turbo',  'asr', 1, '{"language":"auto","sample_rate":16000,"model_size":"turbo"}'),
('whisper-small',  'asr', 0, '{"language":"auto","sample_rate":16000,"model_size":"small"}'),
('opus-mt-zh-en',  'nmt', 1, '{"src_lang":"zh","tgt_lang":"en","temperature":0.3}'),
('opus-mt-en-zh',  'nmt', 1, '{"src_lang":"en","tgt_lang":"zh","temperature":0.3}'),
('gpt-4-turbo',    'llm', 1, '{"temperature":0.7,"max_tokens":4096,"rate_limit":500}'),
('claude-opus',    'llm', 0, '{"temperature":0.7,"max_tokens":4096,"rate_limit":500}'),
('deepseek-v3',    'llm', 0, '{"temperature":0.7,"max_tokens":4096,"rate_limit":500}');

-- 示例翻译记录
INSERT INTO translation_task (user_id, audio_file_name, audio_file_path, audio_duration, src_lang, tgt_lang, detected_lang, transcription, translation, status, created_at) VALUES
(2, 'hello.wav',  '/uploads/hello.wav',  3.2,  'auto', 'zh', 'en', 'Hello, how are you?',  '你好，你怎么样？',     'completed', DATE_SUB(NOW(), INTERVAL 2  HOUR)),
(2, 'morning.wav','/uploads/morning.wav', 4.8, 'auto', 'zh', 'en', 'Good morning everyone', '大家早上好',            'completed', DATE_SUB(NOW(), INTERVAL 1  HOUR)),
(2, 'thanks.wav', '/uploads/thanks.wav',  2.5,  'auto', 'zh', 'en', 'Thank you very much',   '非常感谢',              'completed', DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
(1, 'meeting.wav','/uploads/meeting.wav',12.0, 'en',   'zh', 'en', 'We need to finish the API integration by Friday.', '我们需要在周五之前完成API集成。', 'completed', DATE_SUB(NOW(), INTERVAL 10 MINUTE));

-- 示例系统日志
INSERT INTO system_log (user_id, action, detail, created_at) VALUES
(2, 'login',     'User login success',                            DATE_SUB(NOW(), INTERVAL 3  HOUR)),
(2, 'translate', 'Task #1 completed: hello.wav (en→zh)',          DATE_SUB(NOW(), INTERVAL 2  HOUR)),
(2, 'translate', 'Task #2 completed: morning.wav (en→zh)',        DATE_SUB(NOW(), INTERVAL 1  HOUR)),
(2, 'translate', 'Task #3 completed: thanks.wav (en→zh)',         DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
(1, 'login',     'Admin login success',                           DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
(1, 'translate', 'Task #4 completed: meeting.wav (en→zh)',        DATE_SUB(NOW(), INTERVAL 10 MINUTE));
