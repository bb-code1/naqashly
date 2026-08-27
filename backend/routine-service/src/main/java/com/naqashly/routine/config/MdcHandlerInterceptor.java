package com.naqashly.routine.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.UUID;

/**
 * 🔍 Thread-Local MDC Correlation ID Propagation Interceptor
 * 
 * Extracts "X-Correlation-Id" from request headers and binds it to Logback MDC.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Component
public class MdcHandlerInterceptor implements HandlerInterceptor {

    public static final String CORRELATION_ID_HEADER = "X-Correlation-Id";
    public static final String MDC_KEY = "correlationId";

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String correlationId = request.getHeader(CORRELATION_ID_HEADER);
        if (correlationId == null || correlationId.isBlank()) {
            correlationId = UUID.randomUUID().toString(); // Fallback if direct call bypassed gateway
        }
        MDC.put(MDC_KEY, correlationId);
        
        // Propagate back in response headers for client tracking/debugging
        response.setHeader(CORRELATION_ID_HEADER, correlationId);
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        // Crucial: Clear MDC on thread completion to prevent memory leaks in Thread Pools
        MDC.remove(MDC_KEY);
    }
}
