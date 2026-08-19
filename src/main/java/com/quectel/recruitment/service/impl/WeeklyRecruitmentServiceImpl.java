package com.quectel.recruitment.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.quectel.recruitment.entity.RecruitmentWeek;
import com.quectel.recruitment.entity.WeeklyRecruitment;
import com.quectel.recruitment.mapper.RecruitmentWeekMapper;
import com.quectel.recruitment.mapper.WeeklyRecruitmentMapper;
import com.quectel.recruitment.service.WeeklyRecruitmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * 每周招聘数据 Service 实现
 */
@Service
public class WeeklyRecruitmentServiceImpl extends ServiceImpl<WeeklyRecruitmentMapper, WeeklyRecruitment> implements WeeklyRecruitmentService {

    @Autowired
    private RecruitmentWeekMapper recruitmentWeekMapper;

    @Override
    public List<WeeklyRecruitment> queryList(Long weekId, String positionName, String channel,
                                              String subChannel, String startDate, String endDate) {
        return baseMapper.selectWeeklyList(weekId, positionName, channel, subChannel, startDate, endDate);
    }

    @Override
    public void saveBatch(Long weekId, List<WeeklyRecruitment> list) {
        RecruitmentWeek week = recruitmentWeekMapper.selectById(weekId);
        if (week == null) {
            throw new IllegalArgumentException("该周数据不存在");
        }
        if (week.getStatus() != null && week.getStatus() == 1) {
            throw new IllegalArgumentException("该周已提交，不允许修改明细");
        }
        // 先删除该周旧明细
        remove(new LambdaQueryWrapper<WeeklyRecruitment>()
                .eq(WeeklyRecruitment::getWeekId, weekId));

        if (CollectionUtils.isEmpty(list)) {
            return;
        }
        // 过滤掉全空记录，并补齐 weekId
        List<WeeklyRecruitment> toSave = new ArrayList<>();
        for (WeeklyRecruitment w : list) {
            if (w == null || isEmptyRecord(w)) {
                continue;
            }
            w.setId(null);
            w.setWeekId(weekId);
            toSave.add(w);
        }
        if (!toSave.isEmpty()) {
            saveBatch(toSave);
        }
    }

    /**
     * 判断一条明细是否全空（所有数值为0且文本为空）
     */
    private boolean isEmptyRecord(WeeklyRecruitment w) {
        boolean allZero = (w.getResumeReceived() == null || w.getResumeReceived() == 0)
                && (w.getWrittenExamScheduled() == null || w.getWrittenExamScheduled() == 0)
                && (w.getWrittenExamCompleted() == null || w.getWrittenExamCompleted() == 0)
                && (w.getWrittenExamAccumulated() == null || w.getWrittenExamAccumulated() == 0)
                && (w.getFirstInterview() == null || w.getFirstInterview() == 0)
                && (w.getSecondInterview() == null || w.getSecondInterview() == 0)
                && (w.getHired() == null || w.getHired() == 0)
                && (w.getOfferSigned() == null || w.getOfferSigned() == 0)
                && (w.getOfferRejected() == null || w.getOfferRejected() == 0)
                && (w.getContractBroken() == null || w.getContractBroken() == 0)
                && (w.getPendingContract() == null || w.getPendingContract() == 0)
                && (w.getConsidering() == null || w.getConsidering() == 0)
                && (w.getPendingCommunication() == null || w.getPendingCommunication() == 0)
                && (w.getWeeklyOnboarded() == null || w.getWeeklyOnboarded() == 0);
        boolean allTextEmpty = isBlank(w.getHiredCandidates())
                && isBlank(w.getWeeklyOnboardedNames())
                && isBlank(w.getRemark());
        return allZero && allTextEmpty;
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    @Override
    public WeeklyRecruitment addWeekly(WeeklyRecruitment weekly) {
        save(weekly);
        return weekly;
    }

    @Override
    public WeeklyRecruitment updateWeekly(WeeklyRecruitment weekly) {
        updateById(weekly);
        return weekly;
    }

    @Override
    public void deleteWeekly(Long id) {
        removeById(id);
    }
}
