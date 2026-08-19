package com.naqashly.monolith.finance.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.ZonedDateTime;

/**
 * <h1>Financial Ledger Transaction Entity</h1>
 * 
 * <p><b>WHAT:</b> Relational database entity mapping the {@code transactions} ledger table in PostgreSQL ({@code naqashly_finance_db}).</p>
 * <p><b>WHY:</b> Records granular income and expense logs for auditability, category reporting, and balance adjustments.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    /** Unique Primary Key Transaction ID. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Foreign key reference to target Wallet ID. */
    @Column(name = "wallet_id", nullable = false)
    private Long walletId;

    /** Transaction Type (INCOME or EXPENSE). */
    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false)
    private TransactionType transactionType;

    /** Monetary Amount. */
    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    /** Category classification (e.g., "Food", "Salary", "Rent", "Utilities"). */
    @Column(nullable = false)
    private String category;

    /** Description notes or memo string. */
    private String description;

    /** Timestamp of Transaction Execution. */
    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt = ZonedDateTime.now();

    /** Pre-persist lifecycle callback. */
    @PrePersist
    protected void onCreate() {
        createdAt = ZonedDateTime.now();
    }
}
