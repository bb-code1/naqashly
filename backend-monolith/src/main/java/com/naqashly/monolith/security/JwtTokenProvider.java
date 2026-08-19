package com.naqashly.monolith.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.UUID;

/**
 * <h1>RS256 JWT Token Generator & Validator</h1>
 * 
 * <p><b>WHAT:</b> Generates and validates signed RS256 JSON Web Tokens (Access Tokens) and Refresh Tokens.</p>
 * <p><b>WHY:</b> Unifies token generation (auth domain) and validation (security filter) in the same process.</p>
 */
@Slf4j
@Component
public class JwtTokenProvider {

    private final RsaKeyProvider rsaKeyProvider;
    private final long accessTokenValidityMs = 7L * 24 * 60 * 60 * 1000; // 7 days

    public JwtTokenProvider(RsaKeyProvider rsaKeyProvider) {
        this.rsaKeyProvider = rsaKeyProvider;
    }

    public String generateAccessToken(Long userId, String email, String name, Integer tokenVersion) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + accessTokenValidityMs);
        String jti = UUID.randomUUID().toString();

        return Jwts.builder()
                .header()
                .keyId(rsaKeyProvider.getKeyId())
                .and()
                .id(jti)
                .subject(String.valueOf(userId))
                .claim("email", email)
                .claim("name", name != null ? name : "")
                .claim("token_version", tokenVersion != null ? tokenVersion : 1)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(rsaKeyProvider.getPrivateKey(), Jwts.SIG.RS256)
                .compact();
    }

    public String generateRefreshToken() {
        return UUID.randomUUID().toString();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(rsaKeyProvider.getPublicKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            log.warn("Invalid JWT token: {}", ex.getMessage());
            return false;
        }
    }

    public Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(rsaKeyProvider.getPublicKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Long getUserIdFromToken(String token) {
        Claims claims = getClaims(token);
        return Long.parseLong(claims.getSubject());
    }

    public String getEmailFromToken(String token) {
        Claims claims = getClaims(token);
        return claims.get("email", String.class);
    }
}
