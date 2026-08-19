package com.naqashly.monolith.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

/**
 * <h1>Security Context Helper Utilities</h1>
 * 
 * <p><b>WHAT:</b> Static utility methods to extract authenticated user credentials from the Spring SecurityContext.</p>
 * <p><b>WHY:</b> Allows any service or controller to retrieve the current user without parsing headers manually.</p>
 */
public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static Optional<UserPrincipal> getCurrentUserPrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return Optional.of(principal);
        }
        return Optional.empty();
    }

    public static Long getCurrentUserId() {
        return getCurrentUserPrincipal()
                .map(UserPrincipal::getId)
                .orElse(null);
    }

    public static String getCurrentUserEmail() {
        return getCurrentUserPrincipal()
                .map(UserPrincipal::getEmail)
                .orElse(null);
    }
}
