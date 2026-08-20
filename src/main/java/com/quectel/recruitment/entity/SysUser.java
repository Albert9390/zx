package com.quectel.recruitment.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 系统用户实体
 */
@Data
@TableName("sys_user")
public class SysUser {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 登录用户名（唯一） */
    private String username;

    /** 密码（BCrypt 加密哈希） */
    private String password;

    /** 真实姓名 */
    private String realName;

    /** 角色: ADMIN=管理员, USER=普通用户 */
    private String role;

    /** 状态: 1=启用, 0=禁用 */
    private Integer status;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
