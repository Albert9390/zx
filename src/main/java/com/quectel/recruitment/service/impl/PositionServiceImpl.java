package com.quectel.recruitment.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.quectel.recruitment.entity.Position;
import com.quectel.recruitment.mapper.PositionMapper;
import com.quectel.recruitment.service.PositionService;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 职位需求 Service 实现
 */
@Service
public class PositionServiceImpl extends ServiceImpl<PositionMapper, Position> implements PositionService {

    @Override
    public List<Position> listAll() {
        LambdaQueryWrapper<Position> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByAsc(Position::getSortOrder);
        return list(wrapper);
    }

    @Override
    public Position saveOrUpdatePosition(Position position) {
        saveOrUpdate(position);
        return position;
    }

    @Override
    public void deletePosition(Long id) {
        removeById(id);
    }
}
