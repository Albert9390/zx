package com.quectel.recruitment.controller;

import com.quectel.recruitment.common.Result;
import com.quectel.recruitment.entity.vo.TotalRecruitmentVO;
import com.quectel.recruitment.service.TotalRecruitmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 总报表 Controller
 * 总表数据由每周招聘数据按 需求职位 + 渠道 + 子渠道 汇总计算
 */
@RestController
@RequestMapping("/api/total")
public class TotalRecruitmentController {

    @Autowired
    private TotalRecruitmentService totalRecruitmentService;

    /**
     * 获取总报表数据（汇总自每周招聘数据）
     */
    @GetMapping("/list")
    public Result<List<TotalRecruitmentVO>> list(
            @RequestParam(required = false) String positionName,
            @RequestParam(required = false) String channel) {
        return Result.success(totalRecruitmentService.getTotalReport(positionName, channel));
    }
}
