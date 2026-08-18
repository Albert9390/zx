package com.quectel.recruitment.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 职位需求实体
 */
@Data
@TableName("recruitment_position")
public class Position {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 需求职位名称 */
    private String positionName;

    /** 需求人数(周期) */
    private Integer demandCount;

    /** 排序序号 */
    private Integer sortOrder;

    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
