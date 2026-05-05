package com.notebook.config;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@MapperScan("com.notebook.mapper")
public class MybatisPlusConfig {
}
