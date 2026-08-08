package com.naqashly.routine.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 🔍 Web MVC Configuration
 * 
 * Registers MDC Handler Interceptor for HTTP trace propagation.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final MdcHandlerInterceptor mdcInterceptor;

    public WebConfig(MdcHandlerInterceptor mdcInterceptor) {
        this.mdcInterceptor = mdcInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(mdcInterceptor).addPathPatterns("/**");
    }
}
