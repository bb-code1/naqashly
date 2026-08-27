package com.naqashly.bot.client;

import com.naqashly.bot.client.fallback.FinanceClientFallback;
import com.naqashly.bot.model.CreateTransactionRequest;
import com.naqashly.bot.model.CreateWalletRequest;
import com.naqashly.bot.model.WalletDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@FeignClient(name = "finance-service", url = "${app.services.finance-url:}", fallback = FinanceClientFallback.class)
public interface FinanceClient {

    @GetMapping("/api/v1/finance/wallets")
    List<WalletDto> getWallets();

    @PostMapping("/api/v1/finance/wallets")
    WalletDto createWallet(@RequestBody CreateWalletRequest request);

    @PostMapping("/api/v1/finance/transactions")
    Map<String, Object> createTransaction(@RequestBody CreateTransactionRequest request);

    @GetMapping("/api/v1/finance/transactions")
    List<Map<String, Object>> getTransactions();

    @GetMapping("/api/v1/finance/debts")
    List<Map<String, Object>> getDebts();

    @PostMapping("/api/v1/finance/debts")
    Map<String, Object> createDebtRecord(@RequestBody Map<String, Object> request);
}
