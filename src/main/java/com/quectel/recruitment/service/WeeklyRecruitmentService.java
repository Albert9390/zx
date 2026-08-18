package com.quectel.recruitment.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.quectel.recruitment.entity.WeeklyRecruitment;

import java.util.List;

/**
 * 每周招聘数据 Service
 */
public interface WeeklyRecruitmentService extends IService<WeeklyRecruitment> {

    /**
     * 条件查询每周数据
     */
    List<WeeklyRecruitment> queryList(String positionName, String channel,
                                       String subChannel, String startDate, String endDate);

    /**
     * 添加每周数据
     */
    WeeklyRecruitment addWeekly(WeeklyRecruitment weekly);

    /**
     * 更新每周数据
     */
    WeeklyRecruitment updateWeekly(WeeklyRecruitment weekly);

    /**
     * 删除每周数据
     */
    void deleteWeekly(Long id);
}
