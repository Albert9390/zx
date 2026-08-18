package com.quectel.recruitment.entity.vo;

import lombok.Data;

import java.math.BigDecimal;

/**
 * 总报表数据 VO（由每周招聘数据汇总计算得出）
 */
@Data
public class TotalRecruitmentVO {

    /** 排序序号 */
    private Integer sortOrder;

    /** 需求职位 */
    private String positionName;

    /** 需求人数(周期) */
    private Integer demandCount;

    /** 招募剩余人数 */
    private Integer remainingCount;

    /** 渠道: 校招/社招 */
    private String channel;

    /** 子渠道: 秋招/春招 */
    private String subChannel;

    // ======== 汇总数据（来自每周招聘的SUM） ========

    /** 简历收取 */
    private Integer resumeReceived;

    /** 笔试安排简历推送 */
    private Integer writtenExamScheduled;

    /** 笔试完成 */
    private Integer writtenExamCompleted;

    /** 笔试累计 */
    private Integer writtenExamAccumulated;

    /** 初试 */
    private Integer firstInterview;

    /** 复试 */
    private Integer secondInterview;

    /** 录用 */
    private Integer hired;

    /** 录用累计 */
    private Integer hiredAccumulated;

    /** 签订三方接受offer */
    private Integer offerSigned;

    /** 拒签/取消录用 */
    private Integer offerRejected;

    /** 违约 */
    private Integer contractBroken;

    /** 待签三方 */
    private Integer pendingContract;

    /** 考虑中 */
    private Integer considering;

    /** 待沟通 */
    private Integer pendingCommunication;

    /** 累计报到数 */
    private Integer totalOnboarded;

    // ======== 计算字段（比率） ========

    /** 笔试参加率 = 笔试完成 / 笔试安排 */
    private BigDecimal examAttendanceRate;

    /** 笔试通过率 = 初试 / 笔试完成 */
    private BigDecimal examPassRate;

    /** 面试通过率 = 录用 / 初试 */
    private BigDecimal interviewPassRate;

    /** 签约率 = 签订三方 / 录用 */
    private BigDecimal signRate;

    /** 拒签率 = 拒签 / 录用 */
    private BigDecimal rejectRate;

    /** 违约率 = 违约 / 签订三方 */
    private BigDecimal breachRate;

    /** 备注 */
    private String remark;
}
