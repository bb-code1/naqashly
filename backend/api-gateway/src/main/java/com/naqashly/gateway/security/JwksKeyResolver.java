package com.naqashly.gateway.security;

import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.math.BigInteger;
import java.security.KeyFactory;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.RSAPublicKeySpec;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * <h1>JWKS (JSON Web Key Set) Public RSA Key Resolver</h1>
 * 
 * <p><b>WHAT:</b> Non-blocking reactive component that fetches, parses, and caches public RSA keys from the {@code auth-service} JWKS endpoint ({@code http://localhost:8081/api/v1/auth/.well-known/jwks.json}).</p>
 * <p><b>WHY:</b> Asymmetric RS256 token verification requires the **Public RSA Key** corresponding to the Key ID ({@code kid}) embedded in the JWT header.
 * Fetching and caching public keys dynamically allows {@code api-gateway} to verify JWT signatures without sharing secret keys or calling databases.</p>
 * <p><b>HOW:</b>
 * <ul>
 *   <li>Uses standard non-load-balanced {@link WebClient#create()} to fetch JWKS JSON payload directly from {@code auth-service}.</li>
 *   <li>Extracts Base64URL-encoded Modulus ({@code n}) and Public Exponent ({@code e}).</li>
 *   <li>Constructs Java {@link RSAPublicKey} using {@link KeyFactory} and {@link RSAPublicKeySpec}.</li>
 *   <li>Caches public keys in a thread-safe {@link ConcurrentHashMap} keyed by {@code kid}.</li>
 * </ul>
 * </p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 * @see KeyFactory
 * @see RSAPublicKeySpec
 * @see WebClient
 */
@Component
public class JwksKeyResolver {

    /** Direct WebClient instance for un-intercepted HTTP GET requests. */
    private final WebClient webClient;

    /** In-memory concurrent cache mapping Key ID (kid) to parsed RSAPublicKey instances. */
    private final Map<String, RSAPublicKey> keyCache = new ConcurrentHashMap<>();

    /** JWKS Endpoint URL hosted by auth-service. */
    private final String jwksUrl = "http://localhost:8081/api/v1/auth/.well-known/jwks.json";

    /**
     * Component Constructor creating direct WebClient.
     */
    public JwksKeyResolver() {
        this.webClient = WebClient.create();
    }

    /**
     * Asynchronously Resolves RSA Public Key by Key ID (kid).
     * 
     * @param kid Key Identifier string from JWT header.
     * @return Mono emitting the resolved {@link RSAPublicKey}.
     */
    public Mono<RSAPublicKey> getPublicKey(String kid) {
        // Always refresh JWKS cache from auth-service to seamlessly handle server restarts and key rotations
        return fetchAndCacheKeys()
                .flatMap(keys -> {
                    RSAPublicKey key = keyCache.get(kid);
                    if (key != null) {
                        return Mono.just(key);
                    }
                    return Mono.error(new IllegalArgumentException("Public key not found in JWKS for kid: " + kid));
                });
    }

    /**
     * HTTP Fetcher & RSA Key Spec Parser.
     * 
     * @return Mono emitting the cache map upon completion.
     */
    @SuppressWarnings("unchecked")
    private Mono<Map<String, RSAPublicKey>> fetchAndCacheKeys() {
        return webClient.get()
                .uri(jwksUrl)
                .retrieve()
                .bodyToMono(Map.class)
                .map(jwksResponse -> {
                    List<Map<String, Object>> keys = (List<Map<String, Object>>) jwksResponse.get("keys");
                    if (keys != null) {
                        for (Map<String, Object> keyMap : keys) {
                            try {
                                String kid = (String) keyMap.get("kid");
                                String nStr = (String) keyMap.get("n");
                                String eStr = (String) keyMap.get("e");

                                byte[] nBytes = Base64.getUrlDecoder().decode(nStr);
                                byte[] eBytes = Base64.getUrlDecoder().decode(eStr);

                                BigInteger modulus = new BigInteger(1, nBytes);
                                BigInteger publicExponent = new BigInteger(1, eBytes);

                                RSAPublicKeySpec spec = new RSAPublicKeySpec(modulus, publicExponent);
                                KeyFactory factory = KeyFactory.getInstance("RSA");
                                RSAPublicKey publicKey = (RSAPublicKey) factory.generatePublic(spec);

                                keyCache.put(kid, publicKey);
                            } catch (Exception e) {
                                System.err.println("Failed to parse JWK key: " + e.getMessage());
                            }
                        }
                    }
                    return keyCache;
                });
    }
}
