package com.quectel.recruitment.service.impl;

import com.quectel.recruitment.entity.vo.TotalRecruitmentVO;
import com.quectel.recruitment.mapper.WeeklyRecruitmentMapper;
import com.quectel.recruitment.service.TotalRecruitmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 总报表 Service 实现
 * 总表数据 = 每周招聘数据按 需求职位 + 渠道 + 子渠道 汇总求和
 */
@Service
public class TotalRecruitmentServiceImpl implements TotalRecruitmentService {

    @Autowired
    private WeeklyRecruitmentMapper weeklyRecruitmentMapper;

    @Override
    public List<TotalRecruitmentVO> getTotalReport() {
        List<TotalRecruitmentVO> list = weeklyRecruitmentMapper.selectTotalReport();
        calculateRates(list);
        return list;
    }

    @Override
    public List<TotalRecruitmentVO> getTotalReport(String positionName, String channel) {
        List<TotalRecruitmentVO> all = getTotalReport();
        return all.stream()
                .filter(vo -> positionName == null || positionName.isEmpty()
                        || vo.getPositionName().contains(positionName))
                .filter(vo -> channel == null || channel.isEmpty()
                        || channel.equals(vo.getChannel()))
                .collect(Collectors.toList());
    }

    /**
     * 计算各种比率字段
     */
    private void calculateRates(List<TotalRecruitmentVO> list) {
        for (TotalRecruitmentVO vo : list) {
            // 笔试参加率 = 笔试完成 / 笔试安排简历推送
            vo.setExamAttendanceRate(safeDivide(vo.getWrittenExamCompleted(), vo.getWrittenExamScheduled()));

            // 笔试通过率 = 初试 / 笔试完成
            vo.setExamPassRate(safeDivide(vo.getFirstInterview(), vo.getWrittenExamCompleted()));

            // 面试通过率 = 录用 / 初试
            vo.setInterviewPassRate(safeDivide(vo.getHired(), vo.getFirstInterview()));

            // 签约率 = 签订三方 / 录用
            vo.setSignRate(safeDivide(vo.getOfferSigned(), vo.getHired()));

            // 拒签率 = 拒签 / 录用
            vo.setRejectRate(safeDivide(vo.getOfferRejected(), vo.getHired()));

            // 违约率 = 违约 / 签订三方
            vo.setBreachRate(safeDivide(vo.getContractBroken(), vo.getOfferSigned()));
        }
    }

    /**
     * 安全除法，返回百分比格式的 BigDecimal
     */
    private BigDecimal safeDivide(Integer numerator, Integer denominator) {
        if (numerator == null || numerator == 0) {
            return BigDecimal.ZERO;
        }
        if (denominator == null || denominator == 0) {
            return BigDecimal.ZERO;
        }
        return new BigDecimal(numerator)
                .divide(new BigDecimal(denominator), 4, RoundingMode.HALF_UP);
    }
}
