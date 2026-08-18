package com.quectel.recruitment.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * 页面路由控制器（前后端不分离）
 */
@Controller
public class PageController {

    @GetMapping("/")
    public String index() {
        return "index";
    }

    @GetMapping("/page/weekly")
    public String weekly() {
        return "weekly";
    }

    @GetMapping("/page/total")
    public String total() {
        return "total";
    }

    @GetMapping("/page/position")
    public String position() {
        return "position";
    }
}
