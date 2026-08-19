package com.quectel.recruitment.entity.dto;

import com.quectel.recruitment.entity.WeeklyRecruitment;
import lombok.Data;

import java.util.List;

/**
 * 每周招聘明细批量保存请求 DTO
 * 用于"添加周"后一次性保存该周的所有职位明细
 */
@Data
public class WeeklyBatchSaveDTO {

    /** 所属招聘周ID */
    private Long weekId;

    /** 该周的所有明细（仅包含用户填写了数据的记录） */
    private List<WeeklyRecruitment> list;
}
