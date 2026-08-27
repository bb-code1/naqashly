package com.naqashly.gateway.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * 🔍 Distributed Tracing Correlation ID Gateway Filter
 * 
 * Generates or extracts "X-Correlation-Id" header and propagates it downstream.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Component
public class CorrelationIdFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(CorrelationIdFilter.class);
    public static final String CORRELATION_ID_HEADER = "X-Correlation-Id";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String correlationId = request.getHeaders().getFirst(CORRELATION_ID_HEADER);

        if (correlationId == null || correlationId.isBlank()) {
            correlationId = UUID.randomUUID().toString();
            log.debug("Generated new Correlation ID: [{}] for URI: [{}]", correlationId, request.getURI());
        } else {
            log.debug("Extracted existing Correlation ID: [{}] for URI: [{}]", correlationId, request.getURI());
        }

        // Propagate in exchange attributes and downstream request headers
        exchange.getAttributes().put(CORRELATION_ID_HEADER, correlationId);
        
        ServerHttpRequest mutatedRequest = request.mutate()
                .header(CORRELATION_ID_HEADER, correlationId)
                .build();

        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }

    @Override
    public int getOrder() {
        // High precedence, runs BEFORE security checks
        return -100;
    }
}
