package com.naqashly.finance.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * PostgreSQL Entity for User-Defined Categories & Target Monthly Budgets.
 * Default currency in INR (₹).
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Entity
@Table(name = "categories", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"userId", "name"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CategoryType categoryType; // INCOME | EXPENSE

    @Builder.Default
    private String icon = "📂";

    @Builder.Default
    private String color = "#3B82F6";

    @Column(precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal targetBudget = new BigDecimal("10000.00");

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
