package com.quectel.recruitment.controller;

import com.quectel.recruitment.common.Result;
import com.quectel.recruitment.entity.Position;
import com.quectel.recruitment.service.PositionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 职位需求 Controller
 */
@RestController
@RequestMapping("/api/position")
public class PositionController {

    @Autowired
    private PositionService positionService;

    /** 查询所有职位 */
    @GetMapping("/list")
    public Result<List<Position>> list() {
        return Result.success(positionService.listAll());
    }

    /** 添加或更新职位 */
    @PostMapping("/save")
    public Result<Position> save(@RequestBody Position position) {
        return Result.success(positionService.saveOrUpdatePosition(position));
    }

    /** 删除职位 */
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        positionService.deletePosition(id);
        return Result.success();
    }

    /** 根据ID查询职位 */
    @GetMapping("/{id}")
    public Result<Position> getById(@PathVariable Long id) {
        return Result.success(positionService.getById(id));
    }
}
