package com.quectel.recruitment.entity.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 系统用户出参 VO（列表/详情，不含 password）
 */
@Data
public class SysUserVO {

    /** 主键 */
    private Long id;

    /** 登录用户名 */
    private String username;

    /** 真实姓名 */
    private String realName;

    /** 角色: ADMIN=管理员, USER=普通用户 */
    private String role;

    /** 状态: 1=启用, 0=禁用 */
    private Integer status;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
