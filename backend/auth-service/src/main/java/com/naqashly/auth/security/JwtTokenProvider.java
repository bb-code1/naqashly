package com.naqashly.auth.security;

import com.naqashly.auth.entity.User;
import io.jsonwebtoken.Jwts;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.UUID;

/**
 * <h1>RS256 JWT Token Generator & Cryptographic Signer</h1>
 * 
 * <p><b>WHAT:</b> Generates signed RS256 JSON Web Tokens (Access Tokens) and random Refresh Tokens for authenticated users.</p>
 * <p><b>WHY:</b> Stateless JWT tokens allow microservices to authenticate incoming user requests independently without calling a central database on every API request.</p>
 * <p><b>HOW:</b>
 * <ul>
 *   <li>Uses JJWT 0.12.x builder API to construct standard JWT claims ({@code sub}, {@code jti}, {@code exp}, {@code iat}).</li>
 *   <li>Embeds custom identity claims ({@code email}, {@code name}, {@code token_version}).</li>
 *   <li>Signs tokens using the RSA Private Key provided by {@link RsaKeyProvider}.</li>
 * </ul>
 * </p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 * @see RsaKeyProvider
 * @see Jwts
 */
@Component
public class JwtTokenProvider {

    /**
     * Dependency injected RSA Key Pair provider.
     */
    private final RsaKeyProvider rsaKeyProvider;

    /**
     * Access token lifetime duration in milliseconds (15 Minutes = 900,000 ms).
     */
    private final long accessTokenValidityMs = 15 * 60 * 1000; // 15 minutes

    /**
     * Constructor Dependency Injection.
     * 
     * @param rsaKeyProvider The RSA key provider singleton bean.
     */
    public JwtTokenProvider(RsaKeyProvider rsaKeyProvider) {
        this.rsaKeyProvider = rsaKeyProvider;
    }

    /**
     * RS256 Signed Access Token Generator.
     * 
     * <p><b>WHAT:</b> Builds a compact signed RS256 JWT access token string valid for 15 minutes.</p>
     * <p><b>WHY:</b> Short-lived access tokens limit security vulnerability windows if a token is intercepted in transit.</p>
     * <p><b>HOW:</b>
     * <ol>
     *   <li>Generates a unique JWT ID ({@code jti}) UUID for token tracking & Redis blacklist support.</li>
     *   <li>Sets Subject ({@code sub}) to the user's primary key ID.</li>
     *   <li>Attaches user metadata claims ({@code email}, {@code name}, {@code token_version}).</li>
     *   <li>Applies header claim {@code kid="xbs-auth-key-2026-v1"}.</li>
     *   <li>Signs token header and payload with the RSA Private Key using algorithm {@link Jwts.SIG#RS256}.</li>
     * </ol>
     * </p>
     * 
     * @param user The authenticated {@link User} entity.
     * @return Base64URL encoded compact JWT token string.
     */
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

    /**
     * Secure Random Refresh Token String Generator.
     * 
     * <p><b>WHAT:</b> Generates an opaque cryptographically secure 128-bit UUID token string.</p>
     * <p><b>WHY:</b> Refresh tokens are stored in HttpOnly, Secure, SameSite cookies to allow clients to request new 15-minute access tokens without re-entering passwords.</p>
     * 
     * @return Cryptographic UUID string.
     */
    public String generateRefreshToken() {
        return UUID.randomUUID().toString();
    }
}
