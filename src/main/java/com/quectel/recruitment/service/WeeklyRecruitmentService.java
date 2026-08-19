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
    List<WeeklyRecruitment> queryList(Long weekId, String positionName, String channel,
                                       String subChannel, String startDate, String endDate);

    /**
     * 批量保存某周的所有明细（先删除该周旧明细，再插入新明细）
     *
     * @param weekId 所属招聘周ID
     * @param list   明细列表（仅包含用户填写了数据的记录）
     */
    void saveBatch(Long weekId, List<WeeklyRecruitment> list);

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
