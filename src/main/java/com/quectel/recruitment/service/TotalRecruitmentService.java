package com.quectel.recruitment.service;

import com.quectel.recruitment.entity.vo.TotalRecruitmentVO;

import java.util.List;

/**
 * 总报表 Service（汇总计算）
 */
public interface TotalRecruitmentService {

    /**
     * 获取总报表数据（由每周招聘数据汇总计算）
     */
    List<TotalRecruitmentVO> getTotalReport();

    /**
     * 获取总报表数据（带过滤条件）
     */
    List<TotalRecruitmentVO> getTotalReport(String positionName, String channel);
}
