package com.naqashly.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

/**
 * <h1>Spring Security & Web Security Configuration</h1>
 * 
 * <p><b>WHAT:</b> Defines stateless security filter chains, password hashing algorithms, and request authorization rules for {@code auth-service}.</p>
 * <p><b>WHY:</b> As a stateless authentication provider using JWTs, server-side HTTP sessions and CSRF tokens are unnecessary.
 * Public endpoints (registration, login, JWKS keys) must be accessible to unauthenticated callers while securing management endpoints.</p>
 * <p><b>HOW:</b>
 * <ul>
 *   <li>Disables CSRF, CORS, Form Login, and Basic Auth to enforce pure REST JSON API semantics.</li>
 *   <li>Configures {@link SessionCreationPolicy#STATELESS} so Spring Security creates zero HTTP sessions.</li>
 *   <li>Uses {@link AntPathRequestMatcher} to explicitly permit {@code /api/v1/auth/**} endpoints without authentication challenges.</li>
 * </ul>
 * </p>
 * 
 * @author Naqashly Engineering Team
 * @version 1.0.0
 * @see SecurityFilterChain
 * @see BCryptPasswordEncoder
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Configures the main Spring Security Filter Chain for HTTP request evaluation.
     * 
     * <p><b>WHAT:</b> Builds the {@link SecurityFilterChain} bean defining authentication requirements per URI path pattern.</p>
     * <p><b>WHY:</b> By default, Spring Boot locks down all endpoints with HTTP 403 / 401 challenges. This method overrides defaults to allow open access to auth endpoints.</p>
     * <p><b>HOW:</b>
     * <ol>
     *   <li>{@code csrf(disable)}: CSRF protection is omitted because client requests utilize stateless JWT Bearer headers rather than session cookies.</li>
     *   <li>{@code sessionManagement(STATELESS)}: Instructs Spring Security to never create or read {@code HttpSession} objects.</li>
     *   <li>{@code authorizeHttpRequests}: Applies {@link AntPathRequestMatcher#antMatcher(String)} to allow unauthenticated access to {@code /api/v1/auth/**} and {@code /actuator/**}.</li>
     * </ol>
     * </p>
     * 
     * @param http The {@link HttpSecurity} builder instance.
     * @return The configured {@link SecurityFilterChain} bean.
     * @throws Exception If an error occurs during security chain assembly.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(AbstractHttpConfigurer::disable)
            .formLogin(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(AntPathRequestMatcher.antMatcher("/api/v1/auth/**")).permitAll()
                .requestMatchers(AntPathRequestMatcher.antMatcher("/actuator/**")).permitAll()
                .anyRequest().authenticated()
            );

        return http.build();
    }

    /**
     * Password Encoder Bean for One-Way Cryptographic Hashing.
     * 
     * <p><b>WHAT:</b> Returns a {@link BCryptPasswordEncoder} instance utilizing strong key stretching (salt + rounds).</p>
     * <p><b>WHY:</b> Storing raw plaintext passwords in databases violates security standards (OWASP). BCrypt automatically handles salt generation and computationally expensive hashing to resist dictionary & brute-force attacks.</p>
     * <p><b>HOW:</b> Used by {@code AuthController} during user registration to hash passwords before database persistence, and during login to verify plain passwords against stored hashes.</p>
     * 
     * @return The {@link PasswordEncoder} singleton bean.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Explicit UserDetailsService Bean.
     * 
     * <p><b>WHAT:</b> Registers an empty {@link InMemoryUserDetailsManager} bean in the application context.</p>
     * <p><b>WHY:</b> Prevents Spring Boot's {@code UserDetailsServiceAutoConfiguration} from auto-generating a random temporary security password in application logs on startup.</p>
     * <p><b>HOW:</b> Satisfies Spring Security's requirement for a {@link UserDetailsService} bean while delegating actual user authentication to custom database queries in {@code AuthController}.</p>
     * 
     * @return An empty {@link UserDetailsService} bean.
     */
    @Bean
    public UserDetailsService userDetailsService() {
        return new InMemoryUserDetailsManager();
    }
}
