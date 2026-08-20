package com.quectel.recruitment.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.quectel.recruitment.entity.SysUser;
import com.quectel.recruitment.entity.vo.SysUserVO;
import com.quectel.recruitment.mapper.SysUserMapper;
import com.quectel.recruitment.service.SysUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 系统用户 Service 实现
 */
@Service
public class SysUserServiceImpl extends ServiceImpl<SysUserMapper, SysUser> implements SysUserService {

    /** 角色常量 */
    private static final String ROLE_ADMIN = "ADMIN";

    /** 密码加密器（BCrypt） */
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public List<SysUserVO> listUsers() {
        // 按创建时间升序返回，便于管理页展示
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByAsc(SysUser::getCreateTime);
        List<SysUser> users = list(wrapper);
        // 手动转换为出参 VO，避免回传密码字段
        List<SysUserVO> result = new ArrayList<>();
        for (SysUser user : users) {
            result.add(toVO(user));
        }
        return result;
    }

    @Override
    public SysUser findByUsername(String username) {
        // 用户名精确匹配，用于登录时按用户名加载用户
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysUser::getUsername, username);
        return getOne(wrapper);
    }

    @Override
    public SysUser addUser(SysUser user) {
        // 入参基础校验：用户名、密码、角色必填
        if (isBlank(user.getUsername())) {
            throw new IllegalArgumentException("用户名不能为空");
        }
        if (isBlank(user.getPassword())) {
            throw new IllegalArgumentException("密码不能为空");
        }
        if (isBlank(user.getRole())) {
            throw new IllegalArgumentException("角色不能为空");
        }
        // 用户名唯一校验
        ensureUsernameUnique(user.getUsername(), null);
        // 密码 BCrypt 加密后落库，明文永不入库
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        // 状态缺省为启用
        if (user.getStatus() == null) {
            user.setStatus(1);
        }
        user.setId(null);
        user.setCreateTime(LocalDateTime.now());
        user.setUpdateTime(LocalDateTime.now());
        save(user);
        return user;
    }

    @Override
    public SysUser updateUser(SysUser user) {
        if (user.getId() == null) {
            throw new IllegalArgumentException("用户ID不能为空");
        }
        SysUser existing = getById(user.getId());
        if (existing == null) {
            throw new IllegalArgumentException("用户不存在");
        }
        // 用户名唯一校验（排除自身）
        ensureUsernameUnique(user.getUsername(), user.getId());
        // 若将「最后一个启用管理员」改为非管理员角色，则阻止（防止系统失去管理员入口）
        if (ROLE_ADMIN.equals(existing.getRole())
                && Integer.valueOf(1).equals(existing.getStatus())
                && !ROLE_ADMIN.equals(user.getRole())
                && isLastEnabledAdmin()) {
            throw new IllegalArgumentException("至少保留一个启用状态的管理员");
        }
        // 仅更新允许编辑的字段，密码不在此处修改
        existing.setUsername(user.getUsername());
        existing.setRealName(user.getRealName());
        existing.setRole(user.getRole());
        existing.setUpdateTime(LocalDateTime.now());
        updateById(existing);
        return existing;
    }

    @Override
    public void deleteUser(Long id) {
        SysUser existing = getById(id);
        if (existing == null) {
            throw new IllegalArgumentException("用户不存在");
        }
        // 禁止删除当前登录用户自身
        String currentUsername = currentUsername();
        if (currentUsername != null && currentUsername.equals(existing.getUsername())) {
            throw new IllegalArgumentException("不能删除当前登录用户");
        }
        // 禁止删除最后一个启用管理员
        if (ROLE_ADMIN.equals(existing.getRole())
                && Integer.valueOf(1).equals(existing.getStatus())
                && isLastEnabledAdmin()) {
            throw new IllegalArgumentException("至少保留一个启用状态的管理员");
        }
        removeById(id);
    }

    @Override
    public void resetPassword(Long id, String newPassword) {
        if (isBlank(newPassword)) {
            throw new IllegalArgumentException("新密码不能为空");
        }
        SysUser existing = getById(id);
        if (existing == null) {
            throw new IllegalArgumentException("用户不存在");
        }
        // 重置密码：BCrypt 加密后覆盖
        existing.setPassword(passwordEncoder.encode(newPassword));
        existing.setUpdateTime(LocalDateTime.now());
        updateById(existing);
    }

    @Override
    public void updateStatus(Long id, Integer status) {
        SysUser existing = getById(id);
        if (existing == null) {
            throw new IllegalArgumentException("用户不存在");
        }
        // 禁用最后一个启用管理员时阻止，避免系统无法登录
        if (Integer.valueOf(0).equals(status)
                && ROLE_ADMIN.equals(existing.getRole())
                && Integer.valueOf(1).equals(existing.getStatus())
                && isLastEnabledAdmin()) {
            throw new IllegalArgumentException("至少保留一个启用状态的管理员");
        }
        existing.setStatus(status);
        existing.setUpdateTime(LocalDateTime.now());
        updateById(existing);
    }

    /**
     * 判断当前目标是否为「最后一个启用状态的管理员」
     *
     * @return true 表示启用管理员仅剩 1 个
     */
    private boolean isLastEnabledAdmin() {
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysUser::getRole, ROLE_ADMIN).eq(SysUser::getStatus, 1);
        return count(wrapper) <= 1;
    }

    /**
     * 用户名唯一校验（excludeId 为 null 表示新增，否则编辑时排除自身）
     *
     * @param username  待校验用户名
     * @param excludeId 排除的用户ID（编辑场景）
     */
    private void ensureUsernameUnique(String username, Long excludeId) {
        if (isBlank(username)) {
            throw new IllegalArgumentException("用户名不能为空");
        }
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysUser::getUsername, username);
        if (excludeId != null) {
            wrapper.ne(SysUser::getId, excludeId);
        }
        if (count(wrapper) > 0) {
            throw new IllegalArgumentException("用户名已存在");
        }
    }

    /**
     * 获取当前登录用户名（从 Spring Security 上下文读取）
     *
     * @return 当前登录用户名，未登录返回 null
     */
    private String currentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return null;
        }
        return auth.getName();
    }

    /**
     * 实体转出参 VO（不回传密码）
     *
     * @param user 用户实体
     * @return 用户出参 VO
     */
    private SysUserVO toVO(SysUser user) {
        SysUserVO vo = new SysUserVO();
        vo.setId(user.getId());
        vo.setUsername(user.getUsername());
        vo.setRealName(user.getRealName());
        vo.setRole(user.getRole());
        vo.setStatus(user.getStatus());
        vo.setCreateTime(user.getCreateTime());
        vo.setUpdateTime(user.getUpdateTime());
        return vo;
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
