package com.naqashly.auth.controller;

import com.naqashly.auth.entity.TelegramLinkCode;
import com.naqashly.auth.entity.User;
import com.naqashly.auth.repository.TelegramLinkCodeRepository;
import com.naqashly.auth.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.ZonedDateTime;
import java.util.Map;
import java.util.Optional;

/**
 * <h1>TelegramAuthController</h1>
 * 
 * <p><b>WHAT:</b> Internal REST endpoint mapping auth-service methods for connecting and verifying Telegram accounts.</p>
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/auth/telegram")
public class TelegramAuthController {

    private final UserRepository userRepository;
    private final TelegramLinkCodeRepository linkCodeRepository;
    private final SecureRandom random = new SecureRandom();

    public TelegramAuthController(UserRepository userRepository,
                                  TelegramLinkCodeRepository linkCodeRepository) {
        this.userRepository = userRepository;
        this.linkCodeRepository = linkCodeRepository;
    }

    /**
     * Generate temporary numeric link code for dashboard.
     */
    @Transactional
    @PostMapping("/link-code")
    public ResponseEntity<?> generateLinkCode(@RequestHeader("X-User-Id") String userIdHeader) {
        log.info("Generating Telegram linking code for user ID: {}", userIdHeader);
        if (userIdHeader == null || userIdHeader.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "User session is invalid"));
        }

        Long userId = Long.parseLong(userIdHeader);
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
        }

        // Clean up old code
        linkCodeRepository.findByUser(user).ifPresent(old -> {
            linkCodeRepository.delete(old);
            linkCodeRepository.flush();
        });

        // Create new 6-digit numeric activation code
        String code = String.valueOf(100000 + random.nextInt(900000));
        TelegramLinkCode linkCode = TelegramLinkCode.builder()
                .code(code)
                .user(user)
                .expiryDate(ZonedDateTime.now().plusMinutes(10))
                .build();

        linkCodeRepository.save(linkCode);
        log.info("Successfully generated Telegram linking code for user ID: {}", userId);

        return ResponseEntity.ok(Map.of("code", code));
    }

    /**
     * Verify activation code sent by the bot-ingress-service.
     */
    @Transactional
    @PostMapping("/verify")
    public ResponseEntity<?> verifyLinkCode(@RequestParam("chatId") Long chatId,
                                            @RequestParam("code") String code) {
        log.info("Verifying Telegram linking code: {} for chat ID: {}", code, chatId);
        TelegramLinkCode linkCode = linkCodeRepository.findById(code).orElse(null);

        if (linkCode == null) {
            log.warn("Telegram link failed. Invalid code: {}", code);
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired link code. Please try again."));
        }

        if (linkCode.getExpiryDate().isBefore(ZonedDateTime.now())) {
            log.warn("Telegram link failed. Code expired: {}", code);
            linkCodeRepository.delete(linkCode);
            return ResponseEntity.badRequest().body(Map.of("message", "Link code has expired. Please request a new one."));
        }

        User user = linkCode.getUser();
        user.setTelegramChatId(chatId);
        userRepository.save(user);

        // Delete used link code
        linkCodeRepository.delete(linkCode);
        log.info("Successfully linked Telegram chat ID: {} to user ID: {}", chatId, user.getId());

        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "userId", user.getId(),
                "name", user.getName(),
                "email", user.getEmail()
        ));
    }

    /**
     * Get user profile mapping by Telegram Chat ID.
     */
    @GetMapping("/user-by-chat/{chatId}")
    public ResponseEntity<?> getUserByChatId(@PathVariable("chatId") Long chatId) {
        Optional<User> userOpt = userRepository.findByTelegramChatId(chatId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return ResponseEntity.ok(Map.of(
                    "status", "SUCCESS",
                    "userId", user.getId(),
                    "name", user.getName(),
                    "telegramContext", user.getTelegramContext() != null ? user.getTelegramContext() : "WELCOME",
                    "telegramMeta", user.getTelegramMeta() != null ? user.getTelegramMeta() : "{}"
            ));
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "status", "ERROR",
                "message", "User account not linked to this Telegram account"
        ));
    }

    /**
     * Update user dialogue context states for Telegram.
     */
    @Transactional
    @PostMapping("/update-state")
    public ResponseEntity<?> updateTelegramState(@RequestParam("chatId") Long chatId,
                                                 @RequestParam("context") String context,
                                                 @RequestParam("meta") String meta) {
        Optional<User> userOpt = userRepository.findByTelegramChatId(chatId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setTelegramContext(context);
            user.setTelegramMeta(meta);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("status", "SUCCESS"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
    }
}
