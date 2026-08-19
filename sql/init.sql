-- ============================================
-- 招聘报表管理系统 数据库初始化脚本
-- ============================================

CREATE DATABASE IF NOT EXISTS recruitment_report DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE recruitment_report;

-- ----------------------------
-- 1. 职位需求表
-- ----------------------------
DROP TABLE IF EXISTS `recruitment_position`;
CREATE TABLE `recruitment_position` (
    `id`           BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `position_name` VARCHAR(100) NOT NULL COMMENT '需求职位名称',
    `demand_count` INT          DEFAULT 0 COMMENT '需求人数(周期)',
    `sort_order`   INT          DEFAULT 0 COMMENT '排序序号',
    `create_time`  DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_position_name` (`position_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='职位需求表';

-- ----------------------------
-- 2. 每周招聘数据表
-- ----------------------------
DROP TABLE IF EXISTS `weekly_recruitment`;
CREATE TABLE `weekly_recruitment` (
    `id`                        BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `position_name`             VARCHAR(100) NOT NULL COMMENT '需求职位',
    `channel`                   VARCHAR(50)  NOT NULL COMMENT '渠道(校招/社招)',
    `sub_channel`               VARCHAR(50)  DEFAULT NULL COMMENT '子渠道(秋招/春招)',
    `resume_received`           INT          DEFAULT 0 COMMENT '简历收取',
    `written_exam_scheduled`    INT          DEFAULT 0 COMMENT '笔试安排简历推送',
    `written_exam_completed`    INT          DEFAULT 0 COMMENT '笔试完成',
    `written_exam_accumulated`  INT          DEFAULT 0 COMMENT '笔试累计',
    `first_interview`           INT          DEFAULT 0 COMMENT '初试',
    `second_interview`          INT          DEFAULT 0 COMMENT '复试',
    `hired`                     INT          DEFAULT 0 COMMENT '录用',
    `hired_candidates`          VARCHAR(500) DEFAULT NULL COMMENT '录用人选',
    `offer_signed`              INT          DEFAULT 0 COMMENT '签订三方接受offer',
    `offer_rejected`            INT          DEFAULT 0 COMMENT '拒签/取消录用',
    `contract_broken`           INT          DEFAULT 0 COMMENT '违约',
    `pending_contract`          INT          DEFAULT 0 COMMENT '待签三方',
    `considering`               INT          DEFAULT 0 COMMENT '考虑中',
    `pending_communication`     INT          DEFAULT 0 COMMENT '待沟通',
    `weekly_onboarded`          INT          DEFAULT 0 COMMENT '当周报到数',
    `weekly_onboarded_names`    VARCHAR(500) DEFAULT NULL COMMENT '当周报到新人',
    `remark`                    VARCHAR(500) DEFAULT NULL COMMENT '备注',
    `create_date`               DATE         DEFAULT NULL COMMENT '创建时间',
    `create_time`               DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`               DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    INDEX `idx_position_channel` (`position_name`, `channel`, `sub_channel`),
    INDEX `idx_create_date` (`create_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='每周招聘数据表';

-- ----------------------------
-- 初始职位数据
-- ----------------------------
INSERT INTO `recruitment_position` (`position_name`, `demand_count`, `sort_order`) VALUES
('FW', 36, 1),
('FW_eMMC', 11, 2),
('FW_架构', 10, 3),
('FW_UFS', 14, 4),
('FW_SSD', 29, 5),
('MST', 3, 6),
('FAE_UFS', 6, 7),
('FAE_SSD', 1, 8),
('AE', 16, 9),
('IC', 17, 10),
('V&V', 14, 11),
('Linux', 6, 12),
('NAND', 4, 13),
('PM', 16, 14),
('硬件', 2, 15),
('封装工艺', 5, 16),
('电子', 10, 17),
('PKG-Layout', 1, 18),
('BOM', 2, 19),
('NPI测试', 2, 20),
('CQE', 2, 21),
('SQE', 1, 22),
('TE', 5, 23),
('专利', 1, 24),
('培训', 1, 25),
('财务', 1, 26),
('项目申报', 2, 27),
('NPI', 1, 28),
('残疾-总务/HR', 2, 29),
('HR', 1, 30),
('MIS', 2, 31),
('芯片封装设计', 1, 32),
('PE(车规)', 1, 33),
('V&V_eMMC', 1, 34),
('总务', 1, 35);
