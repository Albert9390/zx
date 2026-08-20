package com.quectel.recruitment.controller;

import com.quectel.recruitment.common.Result;
import com.quectel.recruitment.entity.SysUser;
import com.quectel.recruitment.entity.vo.SysUserVO;
import com.quectel.recruitment.service.SysUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 系统用户管理 Controller
 */
@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private SysUserService sysUserService;

    /**
     * 查询所有用户（出参不含密码）
     *
     * @return 用户列表
     */
    @GetMapping("/list")
    public Result<List<SysUserVO>> list() {
        return Result.success(sysUserService.listUsers());
    }

    /**
     * 新增用户（用户名唯一校验，密码 BCrypt 加密）
     *
     * @param user 用户实体（用户名、密码、角色必填）
     * @return 新增后的用户实体
     */
    @PostMapping("/add")
    public Result<SysUser> add(@RequestBody SysUser user) {
        return Result.success(sysUserService.addUser(user));
    }

    /**
     * 编辑用户（密码不在此处修改）
     *
     * @param user 用户实体（id 必填）
     * @return 更新后的用户实体
     */
    @PutMapping("/update")
    public Result<SysUser> update(@RequestBody SysUser user) {
        return Result.success(sysUserService.updateUser(user));
    }

    /**
     * 删除用户（禁止删除自己与最后一个管理员）
     *
     * @param id 用户主键
     * @return 操作结果
     */
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        sysUserService.deleteUser(id);
        return Result.success();
    }

    /**
     * 重置密码（BCrypt 加密后覆盖原密码）
     *
     * @param id    用户主键
     * @param param 请求体，key=newPassword 为新密码明文
     * @return 操作结果
     */
    @PostMapping("/{id}/resetPassword")
    public Result<Void> resetPassword(@PathVariable Long id, @RequestBody Map<String, String> param) {
        // 从请求体中读取新密码明文
        sysUserService.resetPassword(id, param.get("newPassword"));
        return Result.success();
    }

    /**
     * 启用/禁用用户（禁止禁用最后一个管理员）
     *
     * @param id    用户主键
     * @param param 请求体，key=status 为状态（1=启用, 0=禁用）
     * @return 操作结果
     */
    @PostMapping("/{id}/status")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> param) {
        // 从请求体中读取状态值并转为 Integer
        sysUserService.updateStatus(id, Integer.valueOf(param.get("status")));
        return Result.success();
    }
}
