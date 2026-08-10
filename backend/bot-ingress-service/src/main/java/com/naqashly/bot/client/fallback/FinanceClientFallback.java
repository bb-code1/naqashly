package com.naqashly.bot.client.fallback;

import com.naqashly.bot.client.FinanceClient;
import com.naqashly.bot.model.CreateTransactionRequest;
import com.naqashly.bot.model.CreateWalletRequest;
import com.naqashly.bot.model.WalletDto;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class FinanceClientFallback implements FinanceClient {

    @Override
    public List<WalletDto> getWallets() {
        log.warn("Finance service is offline. Returning empty wallets fallback.");
        return Collections.emptyList();
    }

    @Override
    public WalletDto createWallet(CreateWalletRequest request) {
        log.error("Finance service is offline. Cannot create wallet: {}", request.getName());
        throw new IllegalStateException("Finance service is currently offline. Cannot create wallet.");
    }

    @Override
    public Map<String, Object> createTransaction(CreateTransactionRequest request) {
        log.error("Finance service is offline. Cannot create transaction.");
        throw new IllegalStateException("Finance service is currently offline. Transaction cannot be logged.");
    }
}
