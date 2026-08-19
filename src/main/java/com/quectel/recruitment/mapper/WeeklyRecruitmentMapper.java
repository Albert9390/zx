package com.quectel.recruitment.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.quectel.recruitment.entity.WeeklyRecruitment;
import com.quectel.recruitment.entity.vo.TotalRecruitmentVO;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 每周招聘数据 Mapper
 */
public interface WeeklyRecruitmentMapper extends BaseMapper<WeeklyRecruitment> {

    /**
     * 汇总查询：按需求职位 + 渠道 + 子渠道 分组求和，得到总报表数据
     *
     * @return 汇总后的总报表列表
     */
    List<TotalRecruitmentVO> selectTotalReport();

    /**
     * 条件查询每周数据
     *
     * @param positionName 职位名称(模糊)
     * @param channel      渠道
     * @param subChannel   子渠道
     * @param startDate    创建时间范围-开始日期
     * @param endDate      创建时间范围-结束日期
     * @return 每周数据列表
     */
    List<WeeklyRecruitment> selectWeeklyList(@Param("positionName") String positionName,
                                              @Param("channel") String channel,
                                              @Param("subChannel") String subChannel,
                                              @Param("startDate") String startDate,
                                              @Param("endDate") String endDate);
}
