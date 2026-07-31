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
public class WalletDto {
    private Long id;
    private Long userId;
    private String name;
    private String currency;
    private BigDecimal balance;
}
