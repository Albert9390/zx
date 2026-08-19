package com.quectel.recruitment.controller;

import com.quectel.recruitment.common.Result;
import com.quectel.recruitment.entity.WeeklyRecruitment;
import com.quectel.recruitment.entity.dto.WeeklyBatchSaveDTO;
import com.quectel.recruitment.service.WeeklyRecruitmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 每周招聘数据 Controller
 */
@RestController
@RequestMapping("/api/weekly")
public class WeeklyRecruitmentController {

    @Autowired
    private WeeklyRecruitmentService weeklyRecruitmentService;

    /**
     * 查询每周数据列表（支持条件过滤）
     */
    @GetMapping("/list")
    public Result<List<WeeklyRecruitment>> list(
            @RequestParam(required = false) Long weekId,
            @RequestParam(required = false) String positionName,
            @RequestParam(required = false) String channel,
            @RequestParam(required = false) String subChannel,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        List<WeeklyRecruitment> list = weeklyRecruitmentService.queryList(
                weekId, positionName, channel, subChannel, startDate, endDate);
        return Result.success(list);
    }

    /** 批量保存某周的所有明细 */
    @PostMapping("/saveBatch")
    public Result<Void> saveBatch(@RequestBody WeeklyBatchSaveDTO dto) {
        weeklyRecruitmentService.saveBatch(dto.getWeekId(), dto.getList());
        return Result.success();
    }

    /** 添加每周数据 */
    @PostMapping("/add")
    public Result<WeeklyRecruitment> add(@RequestBody WeeklyRecruitment weekly) {
        return Result.success(weeklyRecruitmentService.addWeekly(weekly));
    }

    /** 更新每周数据 */
    @PutMapping("/update")
    public Result<WeeklyRecruitment> update(@RequestBody WeeklyRecruitment weekly) {
        return Result.success(weeklyRecruitmentService.updateWeekly(weekly));
    }

    /** 删除每周数据 */
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        weeklyRecruitmentService.deleteWeekly(id);
        return Result.success();
    }

    /** 根据ID查询 */
    @GetMapping("/{id}")
    public Result<WeeklyRecruitment> getById(@PathVariable Long id) {
        return Result.success(weeklyRecruitmentService.getById(id));
    }
}
