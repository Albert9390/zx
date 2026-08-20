package com.quectel.recruitment.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.quectel.recruitment.entity.SysUser;
import com.quectel.recruitment.entity.vo.SysUserVO;

import java.util.List;

/**
 * 系统用户 Service
 */
public interface SysUserService extends IService<SysUser> {

    /**
     * 查询所有用户（出参不含密码）
     *
     * @return 用户出参列表
     */
    List<SysUserVO> listUsers();

    /**
     * 按用户名查询用户（用于登录认证加载）
     *
     * @param username 登录用户名
     * @return 用户实体，未找到返回 null
     */
    SysUser findByUsername(String username);

    /**
     * 新增用户（用户名唯一校验，密码 BCrypt 加密）
     *
     * @param user 用户实体（密码必填）
     * @return 新增后的用户实体
     */
    SysUser addUser(SysUser user);

    /**
     * 编辑用户（用户名唯一校验，密码不在此修改）
     *
     * @param user 用户实体（id 必填，password 可为空）
     * @return 更新后的用户实体
     */
    SysUser updateUser(SysUser user);

    /**
     * 删除用户（禁止删除自己与最后一个管理员）
     *
     * @param id 用户主键
     */
    void deleteUser(Long id);

    /**
     * 重置密码（BCrypt 加密后覆盖原密码）
     *
     * @param id          用户主键
     * @param newPassword 新密码（明文）
     */
    void resetPassword(Long id, String newPassword);

    /**
     * 启用/禁用用户（禁止禁用最后一个管理员）
     *
     * @param id     用户主键
     * @param status 状态: 1=启用, 0=禁用
     */
    void updateStatus(Long id, Integer status);
}
