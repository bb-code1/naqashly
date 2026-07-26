package com.naqashly.gateway.filter;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.naqashly.gateway.security.JwksKeyResolver;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.Base64;
import java.util.List;

/**
 * <h1>Reactive RS256 JWT Authentication & Identity Propagation Gateway Filter</h1>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private final JwksKeyResolver jwksKeyResolver;
    private final ReactiveStringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String BLACKLIST_PREFIX = "blacklist:jti:";

    private static final List<String> PUBLIC_ENDPOINTS = List.of(
            "/api/v1/auth/",
            "/api/v1/bot/webhook/",
            "/actuator/"
    );

    private static class JwtAuthException extends RuntimeException {
        public JwtAuthException(String message) {
            super(message);
        }
    }

    public JwtAuthenticationFilter(JwksKeyResolver jwksKeyResolver,
                                   ReactiveStringRedisTemplate redisTemplate) {
        this.jwksKeyResolver = jwksKeyResolver;
        this.redisTemplate = redisTemplate;
    }

    @Override
    public int getOrder() {
        return -1;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        // 0. Skip authentication for pre-flight CORS OPTIONS requests
        if (HttpMethod.OPTIONS.equals(request.getMethod())) {
            return chain.filter(exchange);
        }

        // 1. Skip authentication for public endpoints
        if (isPublicEndpoint(path)) {
            return chain.filter(exchange);
        }

        // 2. Validate presence of Bearer Authorization header
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return onError(exchange, "Missing or invalid Authorization header", HttpStatus.UNAUTHORIZED);
        }

        String token = authHeader.substring(7);

        // 3. Resolve Public RSA Key & Verify RS256 JWT
        return parseAndVerifyJwt(token)
                .onErrorResume(ex -> {
                    System.err.println("JWT Verification Failed: " + ex.getMessage());
                    return Mono.error(new JwtAuthException("Invalid JWT token: " + ex.getMessage()));
                })
                .flatMap(claims -> {
                    String jti = claims.getId();
                    String userId = claims.getSubject();
                    String email = claims.get("email", String.class);
                    String name = claims.get("name", String.class);

                    // 4. Check Redis Token Blacklist
                    return isBlacklisted(jti)
                            .flatMap(blacklisted -> {
                                if (Boolean.TRUE.equals(blacklisted)) {
                                    return onError(exchange, "Token has been revoked", HttpStatus.UNAUTHORIZED);
                                }

                                // 5. Mutate Request Headers & Forward Downstream
                                ServerHttpRequest mutatedRequest = request.mutate()
                                        .header("X-User-Id", userId != null ? userId : "")
                                        .header("X-User-Email", email != null ? email : "")
                                        .header("X-User-Name", name != null ? name : "")
                                        .build();

                                return chain.filter(exchange.mutate().request(mutatedRequest).build());
                            });
                })
                .onErrorResume(Throwable.class, ex -> {
                    System.err.println("[JwtAuthenticationFilter] Auth error: " + ex.getMessage());
                    return onError(exchange, "Authentication failed: " + ex.getMessage(), HttpStatus.UNAUTHORIZED);
                });
    }

    private boolean isPublicEndpoint(String path) {
        return PUBLIC_ENDPOINTS.stream().anyMatch(path::contains);
    }

    private Mono<Claims> parseAndVerifyJwt(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length < 2) {
                return Mono.error(new IllegalArgumentException("Malformed JWT token string"));
            }

            byte[] headerBytes = Base64.getUrlDecoder().decode(parts[0]);
            JsonNode headerJson = objectMapper.readTree(headerBytes);
            
            String kid = headerJson.has("kid") ? headerJson.get("kid").asText() : null;
            if (kid == null || kid.isBlank()) {
                return Mono.error(new IllegalArgumentException("JWT header missing 'kid' claim"));
            }

            return jwksKeyResolver.getPublicKey(kid)
                    .map(publicKey -> {
                        return Jwts.parser()
                                .verifyWith(publicKey)
                                .build()
                                .parseSignedClaims(token)
                                .getPayload();
                    });
        } catch (Exception e) {
            return Mono.error(e);
        }
    }

    private Mono<Boolean> isBlacklisted(String jti) {
        if (jti == null || jti.isBlank()) {
            return Mono.just(false);
        }
        return redisTemplate.hasKey(BLACKLIST_PREFIX + jti)
                .defaultIfEmpty(false);
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus status) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        return response.setComplete();
    }
}
