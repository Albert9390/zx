-- ============================================
-- 招聘报表管理系统 - 提交/锁定机制升级脚本
-- 功能：recruitment_week 增加 status 提交状态字段
--       0 = 未提交(草稿)，1 = 已提交(锁定，计入总报表)
-- ============================================

USE recruitment_report;

ALTER TABLE `recruitment_week`
    ADD COLUMN `status` TINYINT NOT NULL DEFAULT 0 COMMENT '提交状态: 0=未提交, 1=已提交' AFTER `end_date`;
