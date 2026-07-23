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
 * <p><b>WHAT:</b> Global Spring Cloud Gateway filter intercepting all incoming HTTP requests to enforce RS256 JWT verification, Redis token revocation checks, and downstream header injection.</p>
 * <p><b>WHY:</b> Centralizing token validation at the API Gateway edge prevents unauthenticated or revoked requests from ever reaching internal microservices.
 * Microservices behind the gateway (e.g. {@code finance-service}, {@code productivity-service}) can trust the injected {@code X-User-Id} and {@code X-User-Email} headers without repeating database or cryptographic checks.</p>
 * <p><b>HOW:</b>
 * <ol>
 *   <li>Exempts public endpoints ({@code /api/v1/auth/**}, {@code /actuator/**}) from authentication enforcement.</li>
 *   <li>Extracts {@code Authorization: Bearer <token>} header from protected requests.</li>
 *   <li>Extracts Key ID ({@code kid}) from JWT header JSON and fetches matching public RSA key from {@link JwksKeyResolver}.</li>
 *   <li>Parses and verifies RS256 digital signature and expiration ({@code exp}).</li>
 *   <li>Queries Reactive Redis ({@link ReactiveStringRedisTemplate}) to ensure the token's unique JTI ({@code blacklist:jti:<jti>}) is not revoked.</li>
 *   <li>Mutates request headers, adding {@code X-User-Id}, {@code X-User-Email}, and {@code X-User-Name}, then forwards downstream.</li>
 * </ol>
 * </p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 * @see GlobalFilter
 * @see JwksKeyResolver
 * @see ReactiveStringRedisTemplate
 */
@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    /** JWKS Public Key Resolver for fetching RS256 verification keys. */
    private final JwksKeyResolver jwksKeyResolver;

    /** Reactive Redis template for asynchronous non-blocking token blacklist lookup. */
    private final ReactiveStringRedisTemplate redisTemplate;

    /** Jackson ObjectMapper for JSON header parsing. */
    private final ObjectMapper objectMapper = new ObjectMapper();

    /** Redis token blacklist key prefix. */
    private static final String BLACKLIST_PREFIX = "blacklist:jti:";

    /** Public URI path patterns exempt from JWT authentication. */
    private static final List<String> PUBLIC_ENDPOINTS = List.of(
            "/api/v1/auth/",
            "/api/v1/bot/webhook/",
            "/actuator/"
    );

    /**
     * Custom exception wrapper for JWT authentication failures.
     */
    private static class JwtAuthException extends RuntimeException {
        public JwtAuthException(String message) {
            super(message);
        }
    }

    /**
     * Filter Constructor Dependency Injection.
     * 
     * @param jwksKeyResolver JWKS key resolver singleton.
     * @param redisTemplate Reactive Redis template.
     */
    public JwtAuthenticationFilter(JwksKeyResolver jwksKeyResolver,
                                   ReactiveStringRedisTemplate redisTemplate) {
        this.jwksKeyResolver = jwksKeyResolver;
        this.redisTemplate = redisTemplate;
    }

    /**
     * Filter Order Priority (-1 ensures execution before routing).
     * 
     * @return Integer order value (-1).
     */
    @Override
    public int getOrder() {
        return -1;
    }

    /**
     * Global Gateway Filter Handler.
     * 
     * @param exchange The reactive server HTTP exchange context.
     * @param chain The gateway filter chain pipeline.
     * @return Mono signaling completion of request processing.
     */
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

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
                .onErrorResume(JwtAuthException.class, ex -> onError(exchange, ex.getMessage(), HttpStatus.UNAUTHORIZED));
    }

    /**
     * Public Endpoint Evaluator.
     * 
     * @param path Target URI path string.
     * @return {@code true} if path is public; {@code false} otherwise.
     */
    private boolean isPublicEndpoint(String path) {
        return PUBLIC_ENDPOINTS.stream().anyMatch(path::contains);
    }

    /**
     * Non-Blocking Reactive RS256 JWT Verification.
     * 
     * @param token Compact Base64URL JWT string.
     * @return Mono emitting verified {@link Claims}.
     */
    private Mono<Claims> parseAndVerifyJwt(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length < 2) {
                return Mono.error(new IllegalArgumentException("Malformed JWT token string"));
            }

            // Decode Base64URL header JSON
            byte[] headerBytes = Base64.getUrlDecoder().decode(parts[0]);
            JsonNode headerJson = objectMapper.readTree(headerBytes);
            
            String kid = headerJson.has("kid") ? headerJson.get("kid").asText() : null;
            if (kid == null || kid.isBlank()) {
                return Mono.error(new IllegalArgumentException("JWT header missing 'kid' claim"));
            }

            // Asynchronously resolve RSA Public Key and verify signature
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

    /**
     * Reactive Redis Blacklist Lookup.
     * 
     * @param jti Unique JWT ID string.
     * @return Mono emitting {@code true} if blacklisted; {@code false} otherwise.
     */
    private Mono<Boolean> isBlacklisted(String jti) {
        if (jti == null || jti.isBlank()) {
            return Mono.just(false);
        }
        return redisTemplate.hasKey(BLACKLIST_PREFIX + jti)
                .defaultIfEmpty(false);
    }

    /**
     * Error Response Helper.
     * 
     * @param exchange Server HTTP exchange context.
     * @param err Error message string.
     * @param status HTTP Status code.
     * @return Mono signaling completion of error response.
     */
    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus status) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        return response.setComplete();
    }
}
