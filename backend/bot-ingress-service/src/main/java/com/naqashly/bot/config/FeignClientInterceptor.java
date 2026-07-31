package com.naqashly.bot.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * <h1>FeignClientInterceptor</h1>
 * 
 * <p><b>WHAT:</b> Intercepts all outgoing OpenFeign microservice REST requests to dynamically inject HTTP headers.</p>
 * <p><b>WHY:</b> Propagates the validated {@code X-User-Id} identity context from the current Spring Web request thread downstream.</p>
 */
@Component
public class FeignClientInterceptor implements RequestInterceptor {

    private static final String USER_ID_HEADER = "X-User-Id";

    @Override
    public void apply(RequestTemplate template) {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            String userId = request.getHeader(USER_ID_HEADER);
            if (userId != null && !userId.isBlank()) {
                template.header(USER_ID_HEADER, userId);
            }
        }
    }
}
