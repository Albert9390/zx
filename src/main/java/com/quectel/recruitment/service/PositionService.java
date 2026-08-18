package com.quectel.recruitment.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.quectel.recruitment.entity.Position;

import java.util.List;

/**
 * 职位需求 Service
 */
public interface PositionService extends IService<Position> {

    /**
     * 查询所有职位（按排序序号）
     */
    List<Position> listAll();

    /**
     * 添加或更新职位
     */
    Position saveOrUpdatePosition(Position position);

    /**
     * 删除职位
     */
    void deletePosition(Long id);
}
