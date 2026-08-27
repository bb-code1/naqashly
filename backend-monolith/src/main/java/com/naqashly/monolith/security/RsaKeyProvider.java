package com.naqashly.monolith.security;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * <h1>RSA 2048-bit Cryptographic Key Pair Provider</h1>
 * 
 * <p><b>WHAT:</b> Manages in-memory RSA 2048-bit public/private key pair used for signing and validating RS256 JWT access tokens.</p>
 * <p><b>WHY:</b> Asymmetric RS256 cryptography provides high security and fast signature verification.</p>
 */
@Slf4j
@Getter
@Component
public class RsaKeyProvider {

    private KeyPair keyPair;
    private final String keyId = "xbs-auth-key-2026-v1";

    @PostConstruct
    public void initKeys() {
        try {
            log.info("Initializing 2048-bit RSA Cryptographic Key Pair...");
            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
            keyPairGenerator.initialize(2048);
            this.keyPair = keyPairGenerator.generateKeyPair();
            log.info("RSA Key Pair generated successfully with Key ID: {}", keyId);
        } catch (NoSuchAlgorithmException e) {
            log.error("Failed to generate RSA KeyPair: RSA algorithm not supported by JVM", e);
            throw new IllegalStateException("RSA cryptographic algorithm missing in JVM environment", e);
        }
    }

    public RSAPublicKey getPublicKey() {
        return (RSAPublicKey) keyPair.getPublic();
    }

    public RSAPrivateKey getPrivateKey() {
        return (RSAPrivateKey) keyPair.getPrivate();
    }

    public Map<String, Object> getJwksMap() {
        RSAPublicKey publicKey = getPublicKey();
        Map<String, Object> jwk = new HashMap<>();
        jwk.put("kty", "RSA");
        jwk.put("use", "sig");
        jwk.put("alg", "RS256");
        jwk.put("kid", keyId);
        jwk.put("n", Base64.getUrlEncoder().withoutPadding().encodeToString(publicKey.getModulus().toByteArray()));
        jwk.put("e", Base64.getUrlEncoder().withoutPadding().encodeToString(publicKey.getPublicExponent().toByteArray()));

        Map<String, Object> response = new HashMap<>();
        response.put("keys", List.of(jwk));
        return response;
    }
}
