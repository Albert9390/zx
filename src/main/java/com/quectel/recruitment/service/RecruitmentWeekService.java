package com.quectel.recruitment.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.quectel.recruitment.entity.RecruitmentWeek;

import java.time.LocalDate;
import java.util.List;

/**
 * 招聘周 Service
 */
public interface RecruitmentWeekService extends IService<RecruitmentWeek> {

    /**
     * 查询所有招聘周（按开始时间倒序）
     */
    List<RecruitmentWeek> listWeeks();

    /**
     * 根据任意日期计算该日期所在周的信息
     *
     * @param date 任意日期
     * @return 周信息（year、weekNumber、startDate、endDate）
     */
    RecruitmentWeek getWeekInfo(LocalDate date);

    /**
     * 新增招聘周（自动根据开始时间计算年/周数，并校验是否重复）
     *
     * @param week 周信息
     * @return 保存后的周
     */
    RecruitmentWeek addWeek(RecruitmentWeek week);

    /**
     * 删除招聘周（同时删除该周下的每周招聘明细）
     *
     * @param id 周ID
     */
    void deleteWeek(Long id);
}
