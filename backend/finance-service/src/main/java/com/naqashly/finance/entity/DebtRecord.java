package com.naqashly.finance.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.ZonedDateTime;

/**
 * <h1>Interpersonal Debt Record Ledger JPA Entity</h1>
 * 
 * <p><b>WHAT:</b> Credit/Debit debt record tracking money lent (CREDIT) or borrowed (DEBIT) with partial repayment support.</p>
 * 
 * @author Barkat Bashir
 * @version 2.1.0
 */
@Entity
@Table(name = "debt_records", indexes = {
    @Index(name = "idx_debts_user_id", columnList = "user_id"),
    @Index(name = "idx_debts_person_id", columnList = "person_id"),
    @Index(name = "idx_debts_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DebtRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "person_id", nullable = false)
    private Long personId;

    @Column(name = "person_name", nullable = false, length = 100)
    private String personName;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Builder.Default
    @Column(name = "paid_amount", nullable = false, precision = 10, scale = 2, columnDefinition = "numeric(10,2) default 0.00")
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "debt_type", nullable = false, length = 20)
    private DebtType debtType; // CREDIT (money lent), DEBIT (money borrowed)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DebtStatus status; // PENDING, PARTIAL, PAID

    @Column(length = 255)
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private ZonedDateTime updatedAt;
}
