package com.naqashly.routine.listener;

import com.naqashly.routine.config.KafkaConsumerConfig;
import com.naqashly.routine.entity.ProcessedEvent;
import com.naqashly.routine.event.BotCommandEvent;
import com.naqashly.routine.repository.ProcessedEventRepository;
import com.naqashly.routine.service.RoutineService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.Map;

/**
 * <h1>Routine Service Asynchronous Kafka Event Listener</h1>
 * 
 * <p><b>WHAT:</b> Background Kafka Consumer listening to {@code bot-commands-topic} under Consumer Group {@code routine-consumer-group}.</p>
 * <p><b>WHY:</b> Asynchronously logs habit completions and calculates streaks with 2-hour midnight grace windows when users message Telegram or WhatsApp.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 * @see KafkaListener
 */
@Component
public class RoutineKafkaListener {

    private static final Logger log = LoggerFactory.getLogger(RoutineKafkaListener.class);
    private final RoutineService routineService;
    private final ProcessedEventRepository processedEventRepository;

    public RoutineKafkaListener(RoutineService routineService, ProcessedEventRepository processedEventRepository) {
        this.routineService = routineService;
        this.processedEventRepository = processedEventRepository;
    }

    /**
     * Asynchronous Kafka Topic Listener.
     * 
     * @param event Incoming {@link BotCommandEvent} deserialized from Kafka.
     */
    @KafkaListener(topics = "bot-commands-topic", groupId = KafkaConsumerConfig.ROUTINE_CONSUMER_GROUP)
    @Transactional
    public void handleBotCommandEvent(BotCommandEvent event) {
        log.info("Received Kafka Event [{}] from channel [{}]: Action={}", 
                event.getEventId(), event.getChannel(), event.getAction());

        // Deduplication Check (Idempotency)
        if (event.getEventId() != null) {
            if (processedEventRepository.existsById(event.getEventId())) {
                log.warn("Ignored duplicate Kafka event [{}] in RoutineService.", event.getEventId());
                return;
            }
        }

        try {
            if ("LOG_HABIT".equalsIgnoreCase(event.getAction())) {
                String habitTitle = (String) event.getParameters().get("title");
                Long userId = event.getInternalUserId() != null ? event.getInternalUserId() : 1L;

                if (habitTitle != null && !habitTitle.isBlank()) {
                    Map<String, Object> result = routineService.logHabit(
                            userId, habitTitle, event.getChannel(), "Logged via Kafka event " + event.getEventId());

                    log.info("Successfully processed Habit [{}] completion via Kafka event [{}]. Result: {}", 
                            habitTitle, event.getEventId(), result);
                }
            }

            // Persist Event ID to prevent future duplicate execution
            if (event.getEventId() != null) {
                processedEventRepository.save(new ProcessedEvent(event.getEventId(), ZonedDateTime.now()));
            }
        } catch (Exception e) {
            log.error("Failed to process Routine Kafka event [{}]: {}", event.getEventId(), e.getMessage(), e);
            throw new RuntimeException("Forcing rollback on consumer write error", e); // Throw exception so DLQ triggers
        }
    }
}
