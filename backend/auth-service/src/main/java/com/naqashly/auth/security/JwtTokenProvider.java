package com.naqashly.auth.security;

import com.naqashly.auth.entity.User;
import io.jsonwebtoken.Jwts;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.UUID;

@Component
public class JwtTokenProvider {

    private final RsaKeyProvider rsaKeyProvider;
    private final long accessTokenValidityMs = 15 * 60 * 1000; // 15 minutes

    public JwtTokenProvider(RsaKeyProvider rsaKeyProvider) {
        this.rsaKeyProvider = rsaKeyProvider;
    }

    public String generateAccessToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + accessTokenValidityMs);
        String jti = UUID.randomUUID().toString();

        return Jwts.builder()
                .header()
                .keyId(rsaKeyProvider.getKeyId())
                .and()
                .id(jti)
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim("name", user.getName())
                .claim("token_version", user.getTokenVersion())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(rsaKeyProvider.getPrivateKey(), Jwts.SIG.RS256)
                .compact();
    }

    public String generateRefreshToken() {
        return UUID.randomUUID().toString();
    }
}
