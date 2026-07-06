-- Whisper 数据库完整建表脚本
-- MySQL 首次启动时自动执行

USE speech_translate;

-- 用户表
CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT 'BCrypt 加密密码',
    email VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
    avatar VARCHAR(500) DEFAULT NULL COMMENT '头像 URL',
    role VARCHAR(20) NOT NULL DEFAULT 'USER' COMMENT '角色: USER/ADMIN',
    status INT NOT NULL DEFAULT 1 COMMENT '状态: 1=ACTIVE, 2=FROZEN',
    last_login DATETIME DEFAULT NULL COMMENT '最后登录时间',
    deleted INT NOT NULL DEFAULT 0 COMMENT '逻辑删除: 0=未删除, 1=已删除',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统用户';

-- 翻译任务表
CREATE TABLE IF NOT EXISTS translation_task (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT '用户 ID',
    audio_file_name VARCHAR(255) DEFAULT NULL COMMENT '原始音频文件名',
    audio_file_path VARCHAR(500) DEFAULT NULL COMMENT '服务端文件路径',
    audio_duration FLOAT DEFAULT NULL COMMENT '音频时长(秒)',
    src_lang VARCHAR(10) NOT NULL COMMENT '源语言代码',
    tgt_lang VARCHAR(10) NOT NULL COMMENT '目标语言代码',
    detected_lang VARCHAR(10) DEFAULT NULL COMMENT '自动检测语言',
    transcription TEXT DEFAULT NULL COMMENT '转录文本',
    translation TEXT DEFAULT NULL COMMENT '翻译文本',
    segments_json TEXT DEFAULT NULL COMMENT '片段 JSON',
    status VARCHAR(20) NOT NULL DEFAULT 'processing' COMMENT '状态: processing/completed/failed',
    error_message TEXT DEFAULT NULL COMMENT '错误信息',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='翻译任务';

-- 翻译片段表
CREATE TABLE IF NOT EXISTS translation_segment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_id BIGINT NOT NULL COMMENT '任务 ID',
    seq INT NOT NULL COMMENT '片段序号',
    start_time FLOAT NOT NULL COMMENT '开始时间(秒)',
    end_time FLOAT NOT NULL COMMENT '结束时间(秒)',
    source_text TEXT NOT NULL COMMENT '源语言文本',
    target_text TEXT DEFAULT NULL COMMENT '翻译文本',
    confidence FLOAT DEFAULT NULL COMMENT '置信度',
    INDEX idx_task_id (task_id),
    INDEX idx_task_seq (task_id, seq)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='翻译片段';

-- 模型配置表
CREATE TABLE IF NOT EXISTS model_config (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL COMMENT '模型名称',
    model_type VARCHAR(50) NOT NULL COMMENT '模型类型: ASR/NMT/TTS',
    is_enabled INT NOT NULL DEFAULT 1 COMMENT '是否启用: 1=启用, 0=禁用',
    config_json TEXT DEFAULT NULL COMMENT 'JSON 配置',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI 模型配置';

-- 系统日志表
CREATE TABLE IF NOT EXISTS system_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT DEFAULT NULL COMMENT '操作人 ID',
    action VARCHAR(50) NOT NULL COMMENT '操作类型',
    target_id BIGINT DEFAULT NULL COMMENT '目标 ID',
    detail TEXT DEFAULT NULL COMMENT '详情',
    ip VARCHAR(45) DEFAULT NULL COMMENT '客户端 IP',
    user_agent TEXT DEFAULT NULL COMMENT '客户端 UA',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统日志';
