package com.quectel.recruitment.config;

import com.quectel.recruitment.entity.SysUser;
import com.quectel.recruitment.service.SysUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * 系统初始化器：应用启动时创建默认管理员账号
 */
@Component
public class AdminInitializer implements CommandLineRunner {

    @Autowired
    private SysUserService sysUserService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * 应用启动回调：若默认管理员不存在则创建（幂等）
     *
     * @param args 启动参数
     */
    @Override
    public void run(String... args) throws Exception {
        // 幂等校验：管理员已存在则跳过，避免重复创建
        if (sysUserService.findByUsername("admin") != null) {
            return;
        }
        SysUser user = new SysUser();
        user.setUsername("admin");
        // 直接写入已加密密码，避免调用 addUser 二次加密
        user.setPassword(passwordEncoder.encode("admin123"));
        user.setRealName("系统管理员");
        user.setRole("ADMIN");
        user.setStatus(1);
        user.setCreateTime(LocalDateTime.now());
        user.setUpdateTime(LocalDateTime.now());
        sysUserService.save(user);
    }
}
