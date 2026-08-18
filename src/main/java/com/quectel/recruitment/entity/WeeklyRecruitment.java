package com.quectel.recruitment.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 每周招聘数据实体
 */
@Data
@TableName("weekly_recruitment")
public class WeeklyRecruitment {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 需求职位 */
    private String positionName;

    /** 渠道: 校招/社招 */
    private String channel;

    /** 子渠道: 秋招/春招 (社招时为null) */
    private String subChannel;

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

    /** 录用人选(姓名) */
    private String hiredCandidates;

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

    /** 当周报到数 */
    private Integer weeklyOnboarded;

    /** 当周报到新人(姓名) */
    private String weeklyOnboardedNames;

    /** 备注 */
    private String remark;

    /** 开始日期 */
    private LocalDate startDate;

    /** 结束日期 */
    private LocalDate endDate;

    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
