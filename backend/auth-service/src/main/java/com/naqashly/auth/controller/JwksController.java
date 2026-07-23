package com.naqashly.auth.controller;

import com.naqashly.auth.security.RsaKeyProvider;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * <h1>JWKS (JSON Web Key Set) Exporter Controller</h1>
 * 
 * <p><b>WHAT:</b> Public REST controller exposing the standard OAuth2 / OIDC JSON Web Key Set (JWKS) endpoint.</p>
 * <p><b>WHY:</b> Enables API Gateway, external microservices, and third-party consumers to fetch the public RSA key required to verify RS256 JWT signature authenticity dynamically.</p>
 * <p><b>HOW:</b>
 * <ul>
 *   <li>Exposes URI endpoint {@code GET /api/v1/auth/.well-known/jwks.json}.</li>
 *   <li>Delegates key rendering to {@link RsaKeyProvider#getJwksMap()}.</li>
 *   <li>Permitted for unauthenticated callers in {@code SecurityConfig}.</li>
 * </ul>
 * </p>
 * 
 * @author Naqashly Engineering Team
 * @version 1.0.0
 * @see RsaKeyProvider
 */
@RestController
@RequestMapping("/api/v1/auth/.well-known")
public class JwksController {

    /**
     * RSA Key Pair Provider dependency.
     */
    private final RsaKeyProvider rsaKeyProvider;

    /**
     * Controller Constructor Injection.
     * 
     * @param rsaKeyProvider The RSA key provider bean.
     */
    public JwksController(RsaKeyProvider rsaKeyProvider) {
        this.rsaKeyProvider = rsaKeyProvider;
    }

    /**
     * Fetch RFC 7517 Compliant JWKS Public Key Map.
     * 
     * <p><b>WHAT:</b> Returns a JSON object containing the array of public RSA keys (Modulus {@code n}, Exponent {@code e}, Key ID {@code kid}).</p>
     * <p><b>WHY:</b> Standardized format expected by OAuth2 libraries and Spring Cloud Gateway for token validation.</p>
     * <p><b>HOW:</b> Serves request over HTTP GET, producing {@code application/json}.</p>
     * 
     * @return Map structure representing the JSON Web Key Set.
     */
    @GetMapping("/jwks.json")
    public Map<String, Object> getJwks() {
        return rsaKeyProvider.getJwksMap();
    }
}
