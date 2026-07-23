package com.naqashly.finance.controller;

import com.naqashly.finance.entity.Transaction;
import com.naqashly.finance.entity.TransactionType;
import com.naqashly.finance.entity.Wallet;
import com.naqashly.finance.repository.TransactionRepository;
import com.naqashly.finance.repository.WalletRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
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
 * @see TransactionRepository
 * @see WalletRepository
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
     * Post Income or Expense Transaction & Atomically Update Wallet Balance.
     * 
     * <p><b>WHAT:</b> Records a financial transaction and updates the wallet balance within an atomic database transaction.</p>
     * <p><b>HOW:</b>
     * <ol>
     *   <li>Verifies wallet ownership using {@code X-User-Id} header.</li>
     *   <li>Adjusts wallet balance: adds amount if {@link TransactionType#INCOME}, subtracts if {@link TransactionType#EXPENSE}.</li>
     *   <li>Saves updated wallet balance and transaction record atomically.</li>
     * </ol>
     * </p>
     * 
     * @param userId User ID extracted from {@code X-User-Id} header.
     * @param request Transaction request DTO.
     * @return ResponseEntity containing saved transaction and updated wallet balance.
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
     * Get Transaction History for a Wallet.
     * 
     * @param walletId Target Wallet ID.
     * @param userId User ID extracted from {@code X-User-Id} header.
     * @return List of transactions.
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
