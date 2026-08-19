package com.naqashly.monolith.finance.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.ZonedDateTime;

/**
 * <h1>Financial Wallet JPA Entity Specification</h1>
 * 
 * <p><b>WHAT:</b> Relational database entity mapping the {@code wallets} table in PostgreSQL ({@code naqashly_finance_db}).</p>
 * <p><b>WHY:</b> Stores user financial accounts (e.g. "Personal Checking", "Savings", "Crypto Wallet"), keeping track of active balances and currencies per user.</p>
 * <p><b>HOW:</b> Uses JPA ORM annotations alongside Lombok for getter/setter generation. Belongs to a user ID injected from API Gateway headers.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Entity
@Table(name = "wallets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Wallet {

    /** Unique Primary Key Wallet ID. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Owner User ID matching primary key in auth-service users table. */
    @Column(name = "user_id", nullable = false)
    private Long userId;

    /** Wallet account name (e.g., "Cash", "Bank Account", "Savings"). */
    @Column(nullable = false)
    private String name;

    /** ISO 4217 Currency Code (e.g. "USD", "EUR", "GBP", "INR"). */
    @Builder.Default
    @Column(nullable = false, length = 3)
    private String currency = "USD";

    /** Current Wallet Account Balance. */
    @Builder.Default
    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal balance = BigDecimal.ZERO;

    /** Timestamp of Wallet Creation. */
    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt = ZonedDateTime.now();

    /** Pre-persist lifecycle callback. */
    @PrePersist
    protected void onCreate() {
        createdAt = ZonedDateTime.now();
    }
}
