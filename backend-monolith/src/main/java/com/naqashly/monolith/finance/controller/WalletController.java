package com.naqashly.monolith.finance.controller;

import com.naqashly.monolith.finance.entity.Wallet;
import com.naqashly.monolith.finance.repository.WalletRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * <h1>User Financial Wallet Controller</h1>
 * 
 * <p><b>WHAT:</b> REST API controller exposing wallet management endpoints under {@code /api/v1/finance/wallets}.</p>
 * <p><b>WHY:</b> Allows authenticated users to view their financial wallets and create new currency accounts.</p>
 * <p><b>HOW:</b> Reads the {@code X-User-Id} HTTP header injected by {@code api-gateway} after successful RS256 JWT signature verification.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 * @see WalletRepository
 */
@RestController
@RequestMapping("/api/v1/finance/wallets")
public class WalletController {

    private final WalletRepository walletRepository;

    public WalletController(WalletRepository walletRepository) {
        this.walletRepository = walletRepository;
    }

    /**
     * Get All Wallets for Authenticated User.
     * 
     * <p><b>WHAT:</b> Returns a list of all financial wallets owned by the caller.</p>
     * <p><b>WHY:</b> Displays wallet cards and active balances on dashboard UIs.</p>
     * <p><b>HOW:</b> Extracts user ID from {@code X-User-Id} request header injected by API Gateway.</p>
     * 
     * @param userId User ID extracted from {@code X-User-Id} header.
     * @return List of user {@link Wallet} objects.
     */
    @GetMapping
    public ResponseEntity<List<Wallet>> getUserWallets(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<Wallet> wallets = walletRepository.findByUserId(userId);
        return ResponseEntity.ok(wallets);
    }

    /**
     * Create New Financial Wallet.
     * 
     * <p><b>WHAT:</b> Creates a new currency wallet for the authenticated user.</p>
     * 
     * @param userId User ID extracted from {@code X-User-Id} header.
     * @param request Create wallet payload.
     * @return ResponseEntity with created {@link Wallet}.
     */
    @PostMapping
    public ResponseEntity<?> createWallet(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                         @Valid @RequestBody CreateWalletRequest request) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized request"));
        }

        Wallet wallet = Wallet.builder()
                .userId(userId)
                .name(request.getName())
                .currency(request.getCurrency() != null ? request.getCurrency() : "USD")
                .balance(request.getInitialBalance() != null ? request.getInitialBalance() : BigDecimal.ZERO)
                .build();

        Wallet savedWallet = walletRepository.save(wallet);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedWallet);
    }

    /**
     * Create Wallet Request DTO.
     */
    @Data
    public static class CreateWalletRequest {
        @NotBlank(message = "Wallet name is required")
        private String name;

        private String currency = "USD";

        private BigDecimal initialBalance = BigDecimal.ZERO;
    }
}
