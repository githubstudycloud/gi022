-- =====================================================
-- V1: Initial schema - sys_user table
-- Author: enterprise-framework
-- =====================================================

CREATE TABLE IF NOT EXISTS `sys_user`
(
    `id`          BIGINT       NOT NULL COMMENT 'Primary key (snowflake)',
    `username`    VARCHAR(50)  NOT NULL COMMENT 'Login username',
    `password`    VARCHAR(255) NOT NULL COMMENT 'BCrypt hashed password',
    `nickname`    VARCHAR(50)  NOT NULL COMMENT 'Display name',
    `email`       VARCHAR(100) NULL COMMENT 'Email address',
    `phone`       VARCHAR(20)  NULL COMMENT 'Phone number',
    `avatar`      VARCHAR(500) NULL COMMENT 'Avatar URL',
    `status`      TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '0=active, 1=disabled',
    `roles`       VARCHAR(255) NOT NULL DEFAULT 'USER' COMMENT 'Comma-separated roles',
    `create_by`   BIGINT       NULL COMMENT 'Creator user ID',
    `create_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    `update_by`   BIGINT       NULL COMMENT 'Last modifier user ID',
    `update_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update time',
    `deleted`     TINYINT(1)   NOT NULL DEFAULT 0 COMMENT 'Soft delete: 0=active, 1=deleted',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`),
    UNIQUE KEY `uk_email` (`email`),
    KEY `idx_status` (`status`),
    KEY `idx_create_time` (`create_time`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT = 'System users';
