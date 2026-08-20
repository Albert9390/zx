package com.quectel.recruitment.controller;

import com.quectel.recruitment.common.Result;
import com.quectel.recruitment.entity.RecruitmentWeek;
import com.quectel.recruitment.service.RecruitmentWeekService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * 招聘周 Controller
 */
@RestController
@RequestMapping("/api/week")
public class RecruitmentWeekController {

    @Autowired
    private RecruitmentWeekService recruitmentWeekService;

    /** 查询所有招聘周 */
    @GetMapping("/list")
    public Result<List<RecruitmentWeek>> list() {
        return Result.success(recruitmentWeekService.listWeeks());
    }

    /**
     * 根据日期获取该日期所在周的信息（用于前端展示"X年X周"及起止日期）
     */
    @GetMapping("/info")
    public Result<RecruitmentWeek> info(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return Result.success(recruitmentWeekService.getWeekInfo(date));
    }

    /** 新增招聘周 */
    @PostMapping("/add")
    public Result<RecruitmentWeek> add(@RequestBody RecruitmentWeek week) {
        return Result.success(recruitmentWeekService.addWeek(week));
    }

    /** 提交招聘周（锁定，计入总报表） */
    @PostMapping("/{id}/submit")
    public Result<RecruitmentWeek> submit(@PathVariable Long id) {
        return Result.success(recruitmentWeekService.submitWeek(id));
    }

    /** 撤回已提交的招聘周（提交的反操作：解除锁定，恢复为草稿） */
    @PostMapping("/{id}/withdraw")
    public Result<RecruitmentWeek> withdraw(@PathVariable Long id) {
        return Result.success(recruitmentWeekService.withdrawWeek(id));
    }

    /** 删除招聘周（连同其明细，已提交的周不可删除） */
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        recruitmentWeekService.deleteWeek(id);
        return Result.success();
    }
}
