package com.naqashly.bot.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTransactionRequest {
    private Long walletId;
    private String transactionType; // INCOME, EXPENSE
    private BigDecimal amount;
    private String category;
    private String description;
}
