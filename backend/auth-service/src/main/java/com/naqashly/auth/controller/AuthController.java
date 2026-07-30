package com.naqashly.auth.controller;

import com.naqashly.auth.entity.AuthProvider;
import com.naqashly.auth.entity.User;
import com.naqashly.auth.entity.VerificationToken;
import com.naqashly.auth.repository.UserRepository;
import com.naqashly.auth.repository.VerificationTokenRepository;
import com.naqashly.auth.security.JwtTokenProvider;
import com.naqashly.auth.service.EmailService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * <h1>User Authentication & Account Management Controller</h1>
 * 
 * <p><b>WHAT:</b> Primary REST API endpoint handler for user registration and password authentication under {@code /api/v1/auth}.</p>
 * <p><b>WHY:</b> Manages user lifecycle operations (registering new credentials, authenticating logins) and issues RS256 JWT tokens alongside HttpOnly refresh cookies.</p>
 * <p><b>HOW:</b>
 * <ul>
 *   <li>{@code POST /register}: Validates input payload, verifies email uniqueness, hashes passwords via BCrypt, and persists {@link User} entities in PostgreSQL.</li>
 *   <li>{@code POST /login}: Validates user credentials against BCrypt hashes, generates a 15-minute RS256 JWT access token, and sets a 14-day HttpOnly {@code refresh_token} cookie.</li>
 * </ul>
 * </p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 * @see UserRepository
 * @see PasswordEncoder
 * @see JwtTokenProvider
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    /**
     * Data Access Repository for User Entities.
     */
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final VerificationTokenRepository verificationTokenRepository;
    private final EmailService emailService;

    @Value("${app.base-url}")
    private String baseUrl;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtTokenProvider jwtTokenProvider,
                          VerificationTokenRepository verificationTokenRepository,
                          EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.verificationTokenRepository = verificationTokenRepository;
        this.emailService = emailService;
    }

    /**
     * User Account Registration Endpoint.
     * 
     * <p><b>WHAT:</b> Creates a new user account in PostgreSQL database.</p>
     * <p><b>WHY:</b> Allows new platform users to sign up with name, email, and password.</p>
     * <p><b>HOW:</b>
     * <ol>
     *   <li>Validates payload constraints using Jakarta Bean Validation ({@link Valid}).</li>
     *   <li>Queries {@link UserRepository#existsByEmail(String)} to prevent duplicate registrations (returns HTTP 400 Bad Request if taken).</li>
     *   <li>Hashes password via {@link PasswordEncoder#encode(CharSequence)}.</li>
     *   <li>Saves new {@link User} entity to PostgreSQL via Spring Data JPA.</li>
     *   <li>Returns HTTP 201 Created with JSON summary.</li>
     * </ol>
     * </p>
     * 
     * @param request The validated {@link RegisterRequest} DTO payload.
     * @return {@link ResponseEntity} containing success message and assigned user ID.
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is already registered"));
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .provider(AuthProvider.LOCAL)
                .emailVerified(false)
                .build();

        userRepository.save(user);

        // Generate Verification Token
        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = VerificationToken.builder()
                .token(token)
                .user(user)
                .expiryDate(ZonedDateTime.now().plusHours(24))
                .build();
        verificationTokenRepository.save(verificationToken);

        // Send HTML Verification Email
        emailService.sendVerificationEmail(user.getEmail(), user.getName(), token);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "User registered successfully. Please check your email to verify your account.",
                "userId", user.getId(),
                "email", user.getEmail()
        ));
    }

    /**
     * Email Activation & Verification Link Landing Page.
     * 
     * @param token The registration verification UUID token.
     * @return HTTP 302 redirect pointing to the frontend landing page.
     */
    @GetMapping("/verify-email")
    public ResponseEntity<Void> verifyEmail(@RequestParam String token) {
        VerificationToken verificationToken = verificationTokenRepository.findByToken(token)
                .orElse(null);

        if (verificationToken == null) {
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create(baseUrl + "/?verified=false&error=invalid_token"))
                    .build();
        }

        if (verificationToken.getExpiryDate().isBefore(ZonedDateTime.now())) {
            verificationTokenRepository.delete(verificationToken);
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create(baseUrl + "/?verified=false&error=expired_token"))
                    .build();
        }

        User user = verificationToken.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);

        verificationTokenRepository.delete(verificationToken);

        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(baseUrl + "/?verified=true"))
                .build();
    }

    /**
     * User Login & Token Issuance Endpoint.
     * 
     * <p><b>WHAT:</b> Authenticates email/password credentials and issues dual security tokens.</p>
     * <p><b>WHY:</b> Secures platform access by delivering a short-lived RS256 JWT access token (for API requests) and a long-lived HttpOnly cookie (for seamless session refreshing).</p>
     * <p><b>HOW:</b>
     * <ol>
     *   <li>Looks up {@link User} by email via {@link UserRepository#findByEmail(String)}.</li>
     *   <li>Verifies raw password against BCrypt hash via {@link PasswordEncoder#matches(CharSequence, String)}. Returns HTTP 401 Unauthorized if invalid.</li>
     *   <li>Generates RS256 JWT Access Token (15 mins validity).</li>
     *   <li>Generates Refresh Token UUID string and sets {@code Set-Cookie: refresh_token=...; HttpOnly; Path=/api/v1/auth/refresh; Max-Age=14 days}.</li>
     *   <li>Returns HTTP 200 OK with access token and user metadata in JSON response body.</li>
     * </ol>
     * </p>
     * 
     * @param request The validated {@link LoginRequest} DTO payload.
     * @param response The Servlet HTTP response object used to attach HttpOnly cookies.
     * @return {@link ResponseEntity} containing RS256 access token and user details.
     */
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid email or password"));
        }

        if (!user.isEmailVerified()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Email address is not verified. Please check your inbox."));
        }

        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken();

        // Set SameSite=Strict HttpOnly Cookie for Refresh Token
        Cookie cookie = new Cookie("refresh_token", refreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // Set true in production SSL
        cookie.setPath("/api/v1/auth/refresh");
        cookie.setMaxAge(14 * 24 * 60 * 60); // 14 days
        response.addCookie(cookie);

        Map<String, Object> body = new HashMap<>();
        body.put("access_token", accessToken);
        body.put("token_type", "Bearer");
        body.put("expires_in", 900); // 15 mins
        body.put("user", Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail()
        ));

        return ResponseEntity.ok(body);
    }

    /**
     * Google Sign-In & Registration Endpoint.
     * Mapped for pure client-side Google OAuth token resolution.
     */
    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@Valid @RequestBody GoogleLoginRequest request, HttpServletResponse response) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (user == null) {
            // Register new Google OAuth user dynamically
            user = User.builder()
                    .name(request.getName())
                    .email(request.getEmail())
                    .provider(AuthProvider.GOOGLE)
                    .providerId(request.getGoogleId())
                    .emailVerified(true)
                    .passwordHash("") // Social logins don't require local password hashes
                    .build();
            userRepository.save(user);
        } else if (user.getProvider() == AuthProvider.LOCAL) {
            // Link account to Google Provider
            user.setProvider(AuthProvider.GOOGLE);
            user.setProviderId(request.getGoogleId());
            userRepository.save(user);
        }

        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken();

        // Set SameSite=Strict HttpOnly Cookie for Refresh Token
        Cookie cookie = new Cookie("refresh_token", refreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/api/v1/auth/refresh");
        cookie.setMaxAge(14 * 24 * 60 * 60); // 14 days
        response.addCookie(cookie);

        Map<String, Object> body = new HashMap<>();
        body.put("access_token", accessToken);
        body.put("token_type", "Bearer");
        body.put("expires_in", 900); // 15 mins
        body.put("user", Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail()
        ));

        return ResponseEntity.ok(body);
    }

    /**
     * Google Sign-In Request DTO Payload.
     */
    @Data
    public static class GoogleLoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Name is required")
        private String name;

        @NotBlank(message = "Google ID is required")
        private String googleId;
    }

    /**
     * User Registration Request DTO Payload.
     * 
     * <p><b>WHAT:</b> Data Transfer Object for account registration JSON input.</p>
     * <p><b>WHY:</b> Decouples REST API presentation layer from underlying database entities and enforces validation constraints.</p>
     */
    @Data
    public static class RegisterRequest {
        /** User full display name. Cannot be blank. */
        @NotBlank(message = "Name is required")
        private String name;

        /** User unique login email. Must be valid email format. */
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        /** Plaintext account password. Cannot be blank. */
        @NotBlank(message = "Password is required")
        private String password;
    }

    /**
     * User Login Request DTO Payload.
     * 
     * <p><b>WHAT:</b> Data Transfer Object for login JSON input.</p>
     * <p><b>WHY:</b> Validates mandatory email and password fields before executing database authentication.</p>
     */
    @Data
    public static class LoginRequest {
        /** User login email address. */
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        /** Plaintext account password. */
        @NotBlank(message = "Password is required")
        private String password;
    }
}
