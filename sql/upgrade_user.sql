-- ============================================
-- 招聘报表管理系统 - 用户与登录升级脚本
-- 功能：新增 sys_user 系统用户表，用于登录认证与基于角色的访问控制
--       角色: ADMIN=管理员(可见全部页面), USER=普通用户(仅每周招聘/总报表)
--       状态: 1=启用, 0=禁用
-- 默认管理员由启动类 AdminInitializer 幂等创建（避免在 SQL 中硬编码 BCrypt 哈希）
-- ============================================

USE recruitment_report;

CREATE TABLE IF NOT EXISTS `sys_user` (
    `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
    `username`    VARCHAR(64)  NOT NULL COMMENT '登录用户名（唯一）',
    `password`    VARCHAR(128) NOT NULL COMMENT '密码（BCrypt 加密哈希）',
    `real_name`   VARCHAR(64)  DEFAULT NULL COMMENT '真实姓名',
    `role`        VARCHAR(16)  NOT NULL DEFAULT 'USER' COMMENT '角色: ADMIN=管理员, USER=普通用户',
    `status`      TINYINT      NOT NULL DEFAULT 1 COMMENT '状态: 1=启用, 0=禁用',
    `create_time` DATETIME     DEFAULT NULL COMMENT '创建时间',
    `update_time` DATETIME     DEFAULT NULL COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_sys_user_username` (`username`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci COMMENT ='系统用户表';
