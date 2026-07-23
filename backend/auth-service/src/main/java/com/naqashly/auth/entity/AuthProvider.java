package com.naqashly.auth.entity;

/**
 * <h1>Authentication Provider Type Enum</h1>
 * 
 * <p><b>WHAT:</b> Enumeration representing supported user identity authentication providers.</p>
 * <p><b>WHY:</b> Distinguishes between local email/password users and federated OAuth2 / OIDC social logins (Google, GitHub), ensuring password checks are omitted for social users.</p>
 * <p><b>HOW:</b> Stored as a string column ({@code provider}) in the PostgreSQL {@code users} table via JPA {@code @Enumerated(EnumType.STRING)}.</p>
 * 
 * @author Naqashly Engineering Team
 * @version 1.0.0
 */
public enum AuthProvider {
    /**
     * Local email and password authentication stored directly in PostgreSQL database.
     */
    LOCAL,

    /**
     * Google OAuth2 / OpenID Connect identity provider.
     */
    GOOGLE,

    /**
     * GitHub OAuth2 identity provider.
     */
    GITHUB
}
