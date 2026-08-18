package com.quectel.recruitment.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.quectel.recruitment.entity.WeeklyRecruitment;
import com.quectel.recruitment.mapper.WeeklyRecruitmentMapper;
import com.quectel.recruitment.service.WeeklyRecruitmentService;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 每周招聘数据 Service 实现
 */
@Service
public class WeeklyRecruitmentServiceImpl extends ServiceImpl<WeeklyRecruitmentMapper, WeeklyRecruitment> implements WeeklyRecruitmentService {

    @Override
    public List<WeeklyRecruitment> queryList(String positionName, String channel,
                                              String subChannel, String startDate, String endDate) {
        return baseMapper.selectWeeklyList(positionName, channel, subChannel, startDate, endDate);
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
