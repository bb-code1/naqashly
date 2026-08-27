package com.naqashly.monolith.finance.controller;

import com.naqashly.monolith.finance.entity.Transaction;
import com.naqashly.monolith.finance.entity.TransactionType;
import com.naqashly.monolith.finance.entity.Wallet;
import com.naqashly.monolith.finance.repository.TransactionRepository;
import com.naqashly.monolith.finance.repository.WalletRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * <h1>Financial Transaction Ledger Controller</h1>
 * 
 * <p><b>WHAT:</b> REST API controller exposing income/expense transaction endpoints under {@code /api/v1/finance/transactions}.</p>
 * <p><b>WHY:</b> Manages monetary deposits, expense debits, ledger recording, and automatic wallet balance updates.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/v1/finance/transactions")
public class TransactionController {

    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;

    public TransactionController(TransactionRepository transactionRepository,
                                  WalletRepository walletRepository) {
        this.transactionRepository = transactionRepository;
        this.walletRepository = walletRepository;
    }

    /**
     * Get All Transactions for Authenticated User across all Wallets.
     * 
     * @param userId User ID extracted from {@code X-User-Id} header.
     * @return List of user transactions.
     */
    @GetMapping
    public ResponseEntity<List<Transaction>> getAllUserTransactions(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<Wallet> wallets = walletRepository.findByUserId(userId);
        if (wallets.isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        List<Long> walletIds = wallets.stream().map(Wallet::getId).toList();
        List<Transaction> transactions = transactionRepository.findByWalletIdInOrderByCreatedAtDesc(walletIds);
        return ResponseEntity.ok(transactions);
    }

    /**
     * Post Income or Expense Transaction & Atomically Update Wallet Balance.
     */
    @PostMapping
    @Transactional
    public ResponseEntity<?> createTransaction(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                               @Valid @RequestBody CreateTransactionRequest request) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized request"));
        }

        Wallet wallet = walletRepository.findByIdAndUserId(request.getWalletId(), userId)
                .orElse(null);

        if (wallet == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Wallet not found or unauthorized"));
        }

        // Adjust wallet balance
        BigDecimal amount = request.getAmount();
        if (request.getTransactionType() == TransactionType.INCOME) {
            wallet.setBalance(wallet.getBalance().add(amount));
        } else {
            wallet.setBalance(wallet.getBalance().subtract(amount));
        }

        walletRepository.save(wallet);

        Transaction transaction = Transaction.builder()
                .walletId(wallet.getId())
                .transactionType(request.getTransactionType())
                .amount(amount)
                .category(request.getCategory())
                .description(request.getDescription())
                .build();

        Transaction savedTransaction = transactionRepository.save(transaction);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "transaction", savedTransaction,
                "updatedWalletBalance", wallet.getBalance()
        ));
    }

    /**
     * Get Transaction History for a Specific Wallet.
     */
    @GetMapping("/wallet/{walletId}")
    public ResponseEntity<?> getWalletTransactions(@PathVariable Long walletId,
                                                   @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Wallet wallet = walletRepository.findByIdAndUserId(walletId, userId).orElse(null);
        if (wallet == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Wallet not found or unauthorized"));
        }

        List<Transaction> transactions = transactionRepository.findByWalletIdOrderByCreatedAtDesc(walletId);
        return ResponseEntity.ok(transactions);
    }

    /**
     * Update an Existing Transaction & Atomically Re-adjust Wallet Balance.
     */
    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> updateTransaction(@PathVariable Long id,
                                               @RequestHeader(value = "X-User-Id", required = false) Long userId,
                                               @Valid @RequestBody CreateTransactionRequest request) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized request"));
        }

        Transaction transaction = transactionRepository.findById(id).orElse(null);
        if (transaction == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Transaction not found"));
        }

        Wallet wallet = walletRepository.findByIdAndUserId(transaction.getWalletId(), userId).orElse(null);
        if (wallet == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Wallet not found or unauthorized"));
        }

        // 1. Revert old transaction balance shift from wallet
        BigDecimal oldAmount = transaction.getAmount();
        if (transaction.getTransactionType() == TransactionType.INCOME) {
            wallet.setBalance(wallet.getBalance().subtract(oldAmount));
        } else {
            wallet.setBalance(wallet.getBalance().add(oldAmount));
        }

        // 2. Apply new transaction balance shift
        BigDecimal newAmount = request.getAmount();
        if (request.getTransactionType() == TransactionType.INCOME) {
            wallet.setBalance(wallet.getBalance().add(newAmount));
        } else {
            wallet.setBalance(wallet.getBalance().subtract(newAmount));
        }

        walletRepository.save(wallet);

        // 3. Update transaction record fields
        transaction.setAmount(newAmount);
        transaction.setTransactionType(request.getTransactionType());
        transaction.setCategory(request.getCategory());
        transaction.setDescription(request.getDescription());

        Transaction updated = transactionRepository.save(transaction);

        return ResponseEntity.ok(Map.of(
                "transaction", updated,
                "updatedWalletBalance", wallet.getBalance()
        ));
    }

    /**
     * Delete an Existing Transaction & Atomically Re-adjust Wallet Balance.
     */
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteTransaction(@PathVariable Long id,
                                               @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized request"));
        }

        Transaction transaction = transactionRepository.findById(id).orElse(null);
        if (transaction == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Transaction not found"));
        }

        Wallet wallet = walletRepository.findByIdAndUserId(transaction.getWalletId(), userId).orElse(null);
        if (wallet == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Wallet not found or unauthorized"));
        }

        // Revert transaction balance shift from wallet
        BigDecimal amount = transaction.getAmount();
        if (transaction.getTransactionType() == TransactionType.INCOME) {
            wallet.setBalance(wallet.getBalance().subtract(amount));
        } else {
            wallet.setBalance(wallet.getBalance().add(amount));
        }

        walletRepository.save(wallet);
        transactionRepository.delete(transaction);

        return ResponseEntity.ok(Map.of(
                "message", "Transaction deleted successfully",
                "updatedWalletBalance", wallet.getBalance()
        ));
    }

    /** Create Transaction Request DTO Payload. */
    @Data
    public static class CreateTransactionRequest {
        @NotNull(message = "Wallet ID is required")
        private Long walletId;

        @NotNull(message = "Transaction type is required")
        private TransactionType transactionType;

        @NotNull(message = "Amount is required")
        @Positive(message = "Amount must be positive")
        private BigDecimal amount;

        @NotNull(message = "Category is required")
        private String category;

        private String description;
    }
}
