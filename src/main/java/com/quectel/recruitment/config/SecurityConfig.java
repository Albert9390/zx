package com.quectel.recruitment.config;

import com.quectel.recruitment.entity.SysUser;
import com.quectel.recruitment.service.SysUserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Spring Security 安全配置
 * <p>
 * 说明：
 * 1. 采用 Session + BCrypt 密码的认证方式；
 * 2. 角色映射：数据库 role(ADMIN/USER) 映射为权限 ROLE_ADMIN / ROLE_USER；
 * 3. 页面路由与 REST 接口双层拦截（权限矩阵见 filterChain 内注释）；
 * 4. 关闭 CSRF：内部工具 + fetch 无 token + Session 认证的刻意取舍。
 * <p>
 * 权限矩阵：
 * - ADMIN 管理员：可见全部页面（首页/职位管理/每周招聘/总报表/用户管理）
 * - USER 普通用户：仅可见「每周招聘」「总报表」
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * 密码加密器：BCrypt（盐值自动生成，校验时自动比对）
     *
     * @return BCrypt 密码加密器
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * 用户详情加载器：按用户名查询 sys_user，映射角色与启用状态
     * <p>
     * 通过方法参数注入 SysUserService（而非类字段注入），
     * 避免与 SysUserServiceImpl（其依赖本类的 passwordEncoder Bean）形成循环依赖。
     *
     * @param sysUserService 系统用户 Service（Spring 自动注入）
     * @return Spring Security 用户详情服务
     */
    @Bean
    public UserDetailsService userDetailsService(SysUserService sysUserService) {
        return username -> {
            SysUser user = sysUserService.findByUsername(username);
            if (user == null) {
                throw new UsernameNotFoundException("用户不存在: " + username);
            }
            // role 为空时兜底为普通用户
            String role = user.getRole() == null ? "USER" : user.getRole();
            // status=0 视为禁用账号
            boolean disabled = user.getStatus() != null && user.getStatus() == 0;
            return User.withUsername(user.getUsername())
                    .password(user.getPassword())
                    .roles(role)
                    .disabled(disabled)
                    .build();
        };
    }

    /**
     * 安全过滤链：按权限矩阵拦截页面路由与 REST 接口
     *
     * @param http Spring Security 配置对象
     * @return 安全过滤链
     * @throws Exception 配置异常
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .authorizeRequests(auth -> auth
                        // 静态资源与登录页放行
                        .antMatchers("/static/**", "/css/**", "/js/**", "/favicon.ico").permitAll()
                        .antMatchers("/login").permitAll()

                        // ===== 页面路由权限 =====
                        // 首页：仅管理员
                        .antMatchers("/", "/index").hasRole("ADMIN")
                        // 职位管理、用户管理：仅管理员
                        .antMatchers("/page/position", "/page/user").hasRole("ADMIN")
                        // 每周招聘、总报表：管理员 + 普通用户
                        .antMatchers("/page/weekly", "/page/total").hasAnyRole("ADMIN", "USER")

                        // ===== REST 接口权限 =====
                        // 职位、用户管理接口：仅管理员
                        .antMatchers("/api/position/**", "/api/user/**").hasRole("ADMIN")
                        // 招聘周、每周明细、总报表接口：管理员 + 普通用户
                        .antMatchers("/api/week/**", "/api/weekly/**", "/api/total/**")
                        .hasAnyRole("ADMIN", "USER")

                        // 其余请求需登录
                        .anyRequest().authenticated()
                )
                // ===== 登录配置：自定义登录页 + 按角色跳转 =====
                .formLogin(form -> form
                        .loginPage("/login")
                        .loginProcessingUrl("/login")
                        .successHandler((request, response, authentication) -> {
                            // 管理员跳首页，普通用户跳每周招聘
                            boolean isAdmin = authentication.getAuthorities().stream()
                                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
                            response.sendRedirect(isAdmin ? "/" : "/page/weekly");
                        })
                        .failureUrl("/login?error")
                        .permitAll()
                )
                // ===== 登出配置：清除 Session 并回到登录页 =====
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessUrl("/login?logout")
                        .invalidateHttpSession(true)
                        .deleteCookies("JSESSIONID")
                        .permitAll()
                )
                // ===== 异常处理：未登录跳登录页，无权限返回 403 =====
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) ->
                                response.sendRedirect("/login"))
                        .accessDeniedHandler((request, response, accessDeniedException) ->
                                response.sendRedirect("/page/weekly"))
                )
                // 关闭 CSRF：内部工具 + fetch 无 token + Session 认证
                .csrf(csrf -> csrf.disable());

        return http.build();
    }
}
