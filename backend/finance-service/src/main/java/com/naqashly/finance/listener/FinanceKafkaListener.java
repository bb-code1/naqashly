package com.naqashly.finance.listener;

import com.naqashly.finance.config.KafkaConsumerConfig;
import com.naqashly.finance.entity.Transaction;
import com.naqashly.finance.entity.TransactionType;
import com.naqashly.finance.entity.Wallet;
import com.naqashly.finance.event.BotCommandEvent;
import com.naqashly.finance.repository.TransactionRepository;
import com.naqashly.finance.repository.WalletRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

/**
 * <h1>Finance Service Asynchronous Kafka Event Listener</h1>
 * 
 * <p><b>WHAT:</b> Background Kafka Consumer listening to {@code bot-commands-topic} under Consumer Group {@code finance-consumer-group}.</p>
 * <p><b>WHY:</b> Asynchronously logs financial expense transactions and adjusts wallet balance in PostgreSQL without blocking chat webhooks.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 * @see KafkaListener
 */
@Component
public class FinanceKafkaListener {

    private static final Logger log = LoggerFactory.getLogger(FinanceKafkaListener.class);
    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;

    public FinanceKafkaListener(TransactionRepository transactionRepository,
                                WalletRepository walletRepository) {
        this.transactionRepository = transactionRepository;
        this.walletRepository = walletRepository;
    }

    /**
     * Asynchronous Kafka Topic Listener.
     * 
     * @param event Incoming {@link BotCommandEvent} deserialized from Kafka.
     */
    @KafkaListener(topics = "bot-commands-topic", groupId = KafkaConsumerConfig.FINANCE_CONSUMER_GROUP)
    @Transactional
    public void handleBotCommandEvent(BotCommandEvent event) {
        log.info("Received Kafka Event [{}] from channel [{}]: Action={}", 
                event.getEventId(), event.getChannel(), event.getAction());

        try {
            if ("LOG_EXPENSE".equalsIgnoreCase(event.getAction())) {
                Number amountNum = (Number) event.getParameters().get("amount");
                String category = (String) event.getParameters().get("category");
                Long userId = event.getInternalUserId() != null ? event.getInternalUserId() : 1L;

                if (amountNum != null && category != null) {
                    BigDecimal amount = new BigDecimal(amountNum.toString());

                    // Find or create default wallet for user
                    Wallet wallet = walletRepository.findByUserId(userId).stream()
                            .findFirst()
                            .orElseGet(() -> walletRepository.save(Wallet.builder()
                                    .userId(userId)
                                    .name("Default Wallet")
                                    .currency("USD")
                                    .balance(new BigDecimal("1000.00"))
                                    .build()));

                    // Adjust balance
                    wallet.setBalance(wallet.getBalance().subtract(amount));
                    walletRepository.save(wallet);

                    // Create expense transaction ledger
                    Transaction transaction = Transaction.builder()
                            .walletId(wallet.getId())
                            .transactionType(TransactionType.EXPENSE)
                            .amount(amount)
                            .category(category)
                            .description("Asynchronously Logged via " + event.getChannel() + " Bot Kafka Event [" + event.getEventId() + "]")
                            .build();

                    transactionRepository.save(transaction);
                    log.info("Successfully processed expense of ${} for '{}' via Kafka event [{}]. New Wallet Balance: ${}", 
                            amount, category, event.getEventId(), wallet.getBalance());
                }
            }
        } catch (Exception e) {
            log.error("Failed to process Kafka event [{}]: {}", event.getEventId(), e.getMessage(), e);
        }
    }
}
