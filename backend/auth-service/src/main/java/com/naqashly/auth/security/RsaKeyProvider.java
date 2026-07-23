package com.naqashly.auth.security;

import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
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
 * <h1>RSA 2048-bit Cryptographic Key Pair Provider & JWKS Exporter</h1>
 * 
 * <p><b>WHAT:</b> Manages the RSA 2048-bit public/private key pair used for signing RS256 JWT access tokens and publishing public JWKS JSON specs.</p>
 * <p><b>WHY:</b> Asymmetric RS256 cryptography allows {@code auth-service} to sign tokens using a secret **Private Key**, while public services (such as {@code api-gateway}) can verify token signatures using only the **Public Key** exposed via JWKS.
 * This guarantees microservices never need access to the private key.</p>
 * <p><b>HOW:</b>
 * <ul>
 *   <li>Generates an RSA 2048-bit key pair upon bean initialization via {@link PostConstruct}.</li>
 *   <li>Exposes {@link RSAPrivateKey} for {@code JwtTokenProvider} signature generation.</li>
 *   <li>Exposes {@link RSAPublicKey} formatted according to RFC 7517 JSON Web Key (JWK) standard via {@link #getJwksMap()}.</li>
 * </ul>
 * </p>
 * 
 * @author Naqashly Engineering Team
 * @version 1.0.0
 * @see KeyPairGenerator
 * @see RSAPublicKey
 * @see RSAPrivateKey
 */
@Component
public class RsaKeyProvider {

    /**
     * In-memory RSA KeyPair object holding private and public keys.
     */
    private KeyPair keyPair;

    /**
     * Key Identifier (kid) header claim used to tag signed JWT headers and JWKS key sets.
     */
    private final String keyId = "xbs-auth-key-2026-v1";

    /**
     * PostConstruct Key Pair Initializer.
     * 
     * <p><b>WHAT:</b> Instantiates a 2048-bit RSA key pair upon Spring bean creation.</p>
     * <p><b>WHY:</b> Automatically prepares signing keys when {@code auth-service} boots without requiring manual key generation scripts.</p>
     * <p><b>HOW:</b> Calls {@link KeyPairGenerator#getInstance(String)} for "RSA", configures 2048 key size, and calls {@code generateKeyPair()}.</p>
     * 
     * @throws RuntimeException If the RSA cryptographic algorithm is not supported by the underlying JVM.
     */
    @PostConstruct
    public void initKeys() {
        try {
            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
            keyPairGenerator.initialize(2048);
            this.keyPair = keyPairGenerator.generateKeyPair();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Failed to generate RSA key pair", e);
        }
    }

    /**
     * RSA Private Key Getter.
     * 
     * <p><b>WHAT:</b> Returns the secret {@link RSAPrivateKey}.</p>
     * <p><b>WHY:</b> Used strictly inside {@code auth-service} by {@code JwtTokenProvider} to sign RS256 JWT access tokens.</p>
     * 
     * @return The 2048-bit {@link RSAPrivateKey}.
     */
    public RSAPrivateKey getPrivateKey() {
        return (RSAPrivateKey) keyPair.getPrivate();
    }

    /**
     * RSA Public Key Getter.
     * 
     * <p><b>WHAT:</b> Returns the public {@link RSAPublicKey}.</p>
     * <p><b>WHY:</b> Used to inspect public modulus (n) and exponent (e) for JWKS encoding.</p>
     * 
     * @return The 2048-bit {@link RSAPublicKey}.
     */
    public RSAPublicKey getPublicKey() {
        return (RSAPublicKey) keyPair.getPublic();
    }

    /**
     * Key Identifier Getter.
     * 
     * @return The Key ID string ({@code xbs-auth-key-2026-v1}).
     */
    public String getKeyId() {
        return keyId;
    }

    /**
     * JWKS Specification Data Generator.
     * 
     * <p><b>WHAT:</b> Constructs a JSON Web Key Set (JWKS) dictionary per RFC 7517.</p>
     * <p><b>WHY:</b> API Gateway and downstream clients consume this JSON structure from {@code GET /.well-known/jwks.json} to obtain public verification keys without manual key distribution.</p>
     * <p><b>HOW:</b>
     * <ol>
     *   <li>Extracts RSA Modulus ({@code n}) and Public Exponent ({@code e}) from the public key.</li>
     *   <li>Base64URL encodes both components without padding.</li>
     *   <li>Populates standard fields: {@code kty="RSA"}, {@code alg="RS256"}, {@code use="sig"}, {@code kid=keyId}.</li>
     * </ol>
     * </p>
     * 
     * @return A Map representing the RFC 7517 JWKS JSON object structure.
     */
    public Map<String, Object> getJwksMap() {
        RSAPublicKey publicKey = getPublicKey();
        Map<String, Object> jwk = new HashMap<>();
        jwk.put("kty", "RSA");
        jwk.put("alg", "RS256");
        jwk.put("use", "sig");
        jwk.put("kid", keyId);
        jwk.put("n", Base64.getUrlEncoder().withoutPadding().encodeToString(publicKey.getModulus().toByteArray()));
        jwk.put("e", Base64.getUrlEncoder().withoutPadding().encodeToString(publicKey.getPublicExponent().toByteArray()));

        Map<String, Object> jwks = new HashMap<>();
        jwks.put("keys", List.of(jwk));
        return jwks;
    }
}
