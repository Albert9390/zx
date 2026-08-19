-- ============================================
-- 招聘报表管理系统 - 周维度升级脚本
-- 功能：新增"招聘周"表，weekly_recruitment 增加 week_id 关联
-- ============================================

USE recruitment_report;

-- ----------------------------
-- 1. 招聘周表
-- ----------------------------
CREATE TABLE IF NOT EXISTS `recruitment_week` (
    `id`           BIGINT   NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `year`         INT      NOT NULL COMMENT '年份',
    `week_number`  INT      NOT NULL COMMENT '周数(ISO周)',
    `start_date`   DATE     NOT NULL COMMENT '开始时间(周一)',
    `end_date`     DATE     NOT NULL COMMENT '结束时间(周日)',
    `create_time`  DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_year_week` (`year`, `week_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='招聘周表';

-- ----------------------------
-- 2. weekly_recruitment 增加 week_id 关联
-- ----------------------------
ALTER TABLE `weekly_recruitment`
    ADD COLUMN `week_id` BIGINT DEFAULT NULL COMMENT '所属招聘周ID' AFTER `id`,
    ADD INDEX `idx_week_id` (`week_id`);
