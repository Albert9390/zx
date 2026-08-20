package com.quectel.recruitment.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.quectel.recruitment.entity.RecruitmentWeek;
import com.quectel.recruitment.entity.WeeklyRecruitment;
import com.quectel.recruitment.mapper.RecruitmentWeekMapper;
import com.quectel.recruitment.service.RecruitmentWeekService;
import com.quectel.recruitment.service.WeeklyRecruitmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.time.temporal.WeekFields;
import java.util.List;

/**
 * 招聘周 Service 实现
 */
@Service
public class RecruitmentWeekServiceImpl extends ServiceImpl<RecruitmentWeekMapper, RecruitmentWeek>
        implements RecruitmentWeekService {

    @Autowired
    private WeeklyRecruitmentService weeklyRecruitmentService;

    @Override
    public List<RecruitmentWeek> listWeeks() {
        LambdaQueryWrapper<RecruitmentWeek> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByDesc(RecruitmentWeek::getStartDate);
        List<RecruitmentWeek> weeks = list(wrapper);
        // 填充每个周的明细条数
        for (RecruitmentWeek week : weeks) {
            week.setRecordCount(Math.toIntExact(weeklyRecruitmentService.count(
                    new LambdaQueryWrapper<WeeklyRecruitment>()
                            .eq(WeeklyRecruitment::getWeekId, week.getId()))));
        }
        return weeks;
    }

    @Override
    public RecruitmentWeek getWeekInfo(LocalDate date) {
        if (date == null) {
            date = LocalDate.now();
        }
        // 周一为开始时间，周日为结束时间
        LocalDate monday = date.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate sunday = monday.plusDays(6);
        WeekFields weekFields = WeekFields.ISO;

        RecruitmentWeek week = new RecruitmentWeek();
        week.setYear(monday.get(weekFields.weekBasedYear()));
        week.setWeekNumber(monday.get(weekFields.weekOfWeekBasedYear()));
        week.setStartDate(monday);
        week.setEndDate(sunday);
        return week;
    }

    @Override
    public RecruitmentWeek addWeek(RecruitmentWeek week) {
        if (week.getStartDate() == null) {
            throw new IllegalArgumentException("请选择周开始时间");
        }
        // 以开始时间对齐到周一，重新计算周信息，确保数据一致
        RecruitmentWeek info = getWeekInfo(week.getStartDate());

        // 校验是否重复
        long exists = count(new LambdaQueryWrapper<RecruitmentWeek>()
                .eq(RecruitmentWeek::getYear, info.getYear())
                .eq(RecruitmentWeek::getWeekNumber, info.getWeekNumber()));
        if (exists > 0) {
            throw new IllegalArgumentException(
                    "该周数据已存在（" + info.getYear() + "年第" + info.getWeekNumber() + "周），不允许重复添加");
        }

        week.setId(null);
        week.setYear(info.getYear());
        week.setWeekNumber(info.getWeekNumber());
        week.setStartDate(info.getStartDate());
        week.setEndDate(info.getEndDate());
        save(week);
        return week;
    }

    @Override
    public RecruitmentWeek submitWeek(Long id) {
        RecruitmentWeek week = getById(id);
        if (week == null) {
            throw new IllegalArgumentException("该周数据不存在");
        }
        if (week.getStatus() != null && week.getStatus() == 1) {
            throw new IllegalArgumentException("该周已提交，无需重复提交");
        }
        week.setStatus(1);
        updateById(week);
        return week;
    }

    @Override
    public RecruitmentWeek withdrawWeek(Long id) {
        RecruitmentWeek week = getById(id);
        if (week == null) {
            throw new IllegalArgumentException("该周数据不存在");
        }
        // 反操作校验：未提交（草稿）的周无需撤回
        if (week.getStatus() == null || week.getStatus() != 1) {
            throw new IllegalArgumentException("该周未提交，无需撤回");
        }
        // 状态回退：已提交 -> 未提交（草稿），恢复可编辑/删除，数据不再计入总报表
        week.setStatus(0);
        updateById(week);
        return week;
    }

    @Override
    public void deleteWeek(Long id) {
        RecruitmentWeek week = getById(id);
        if (week == null) {
            throw new IllegalArgumentException("该周数据不存在");
        }
        if (week.getStatus() != null && week.getStatus() == 1) {
            throw new IllegalArgumentException("该周已提交，不允许删除");
        }
        // 先删除该周下的每周招聘明细
        weeklyRecruitmentService.remove(new LambdaQueryWrapper<WeeklyRecruitment>()
                .eq(WeeklyRecruitment::getWeekId, id));
        removeById(id);
    }
}
