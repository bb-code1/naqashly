package com.naqashly.monolith.auth.controller;

import com.naqashly.monolith.auth.entity.AuthProvider;
import com.naqashly.monolith.auth.entity.User;
import com.naqashly.monolith.auth.entity.VerificationToken;
import com.naqashly.monolith.auth.repository.UserRepository;
import com.naqashly.monolith.auth.repository.VerificationTokenRepository;
import com.naqashly.monolith.auth.service.EmailService;
import com.naqashly.monolith.security.JwtTokenProvider;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * <h1>User Authentication Controller</h1>
 * 
 * <p><b>WHAT:</b> REST endpoints for user registration, email verification, login, and Google OAuth under {@code /api/v1/auth}.</p>
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final VerificationTokenRepository verificationTokenRepository;
    private final EmailService emailService;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

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

    @Transactional
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest request) {
        log.info("Received signup request for email: {}", request.getEmail());

        Optional<User> existingUserOpt = userRepository.findByEmail(request.getEmail());
        User user;

        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();
            if (existingUser.isEmailVerified()) {
                log.warn("Signup rejected. Email is already registered and verified: {}", request.getEmail());
                return ResponseEntity.badRequest().body(Map.of("message", "Email is already registered"));
            } else {
                log.info("Found unverified existing user for email: {}. Resending activation email.", request.getEmail());
                existingUser.setName(request.getName());
                existingUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));
                user = userRepository.save(existingUser);

                verificationTokenRepository.findByUser(user).ifPresent(oldToken -> {
                    verificationTokenRepository.delete(oldToken);
                    verificationTokenRepository.flush();
                });
            }
        } else {
            user = User.builder()
                    .name(request.getName())
                    .email(request.getEmail())
                    .passwordHash(passwordEncoder.encode(request.getPassword()))
                    .provider(AuthProvider.LOCAL)
                    .emailVerified(false)
                    .build();
            user = userRepository.save(user);
            log.info("Saved new user record. ID: {}, Email: {}", user.getId(), user.getEmail());
        }

        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = VerificationToken.builder()
                .token(token)
                .user(user)
                .expiryDate(ZonedDateTime.now().plusHours(24))
                .build();
        verificationTokenRepository.save(verificationToken);

        emailService.sendVerificationEmail(user.getEmail(), user.getName(), token);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "User registered successfully. Please check your email to verify your account.",
                "userId", user.getId(),
                "email", user.getEmail()
        ));
    }

    @GetMapping("/verify-email")
    public ResponseEntity<Void> verifyEmail(@RequestParam String token) {
        log.info("Email verification invoked with token: {}", token);
        VerificationToken verificationToken = verificationTokenRepository.findByToken(token).orElse(null);

        if (verificationToken == null) {
            log.warn("Email activation failed. Invalid verification token: {}", token);
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create(frontendUrl + "/?verified=false&error=invalid_token"))
                    .build();
        }

        if (verificationToken.getExpiryDate().isBefore(ZonedDateTime.now())) {
            log.warn("Email activation failed. Expired token for user: {}", verificationToken.getUser().getEmail());
            verificationTokenRepository.delete(verificationToken);
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create(frontendUrl + "/?verified=false&error=expired_token"))
                    .build();
        }

        User user = verificationToken.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);

        verificationTokenRepository.delete(verificationToken);
        log.info("Email successfully verified for user ID: {}, email: {}", user.getId(), user.getEmail());

        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(frontendUrl + "/?verified=true"))
                .build();
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid email or password"));
        }

        if (!user.isEmailVerified()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Email address is not verified. Please check your inbox."));
        }

        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getName(), user.getTokenVersion());
        String refreshToken = jwtTokenProvider.generateRefreshToken();

        Cookie cookie = new Cookie("refresh_token", refreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/api/v1/auth/refresh");
        cookie.setMaxAge(14 * 24 * 60 * 60);
        response.addCookie(cookie);

        Map<String, Object> body = new HashMap<>();
        body.put("access_token", accessToken);
        body.put("token_type", "Bearer");
        body.put("expires_in", 604800);
        body.put("user", Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail()
        ));

        return ResponseEntity.ok(body);
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@Valid @RequestBody GoogleLoginRequest request, HttpServletResponse response) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            user = User.builder()
                    .name(request.getName())
                    .email(request.getEmail())
                    .provider(AuthProvider.GOOGLE)
                    .providerId(request.getGoogleId())
                    .emailVerified(true)
                    .passwordHash("")
                    .build();
            userRepository.save(user);
        } else if (user.getProvider() == AuthProvider.LOCAL) {
            user.setProvider(AuthProvider.GOOGLE);
            user.setProviderId(request.getGoogleId());
            userRepository.save(user);
        }

        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getName(), user.getTokenVersion());
        String refreshToken = jwtTokenProvider.generateRefreshToken();

        Cookie cookie = new Cookie("refresh_token", refreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/api/v1/auth/refresh");
        cookie.setMaxAge(14 * 24 * 60 * 60);
        response.addCookie(cookie);

        Map<String, Object> body = new HashMap<>();
        body.put("access_token", accessToken);
        body.put("token_type", "Bearer");
        body.put("expires_in", 604800);
        body.put("user", Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail()
        ));

        return ResponseEntity.ok(body);
    }

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

    @Data
    public static class RegisterRequest {
        @NotBlank(message = "Name is required")
        private String name;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;
    }

    @Data
    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;
    }
}
