package com.quectel.recruitment.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 招聘周实体
 * 一周为一个数据录入单元，周一为开始时间、周日为结束时间
 */
@Data
@TableName("recruitment_week")
public class RecruitmentWeek {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 年份 */
    private Integer year;

    /** 周数(ISO周) */
    private Integer weekNumber;

    /** 开始时间(周一) */
    private LocalDate startDate;

    /** 结束时间(周日) */
    private LocalDate endDate;

    private LocalDateTime createTime;
    private LocalDateTime updateTime;

    /** 该周明细条数（非表字段，仅用于列表展示） */
    @TableField(exist = false)
    private Integer recordCount;
}
