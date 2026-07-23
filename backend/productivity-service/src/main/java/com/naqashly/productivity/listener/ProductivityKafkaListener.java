package com.naqashly.productivity.listener;

import com.naqashly.productivity.config.KafkaConsumerConfig;
import com.naqashly.productivity.entity.Task;
import com.naqashly.productivity.entity.TaskPriority;
import com.naqashly.productivity.entity.TaskStatus;
import com.naqashly.productivity.event.BotCommandEvent;
import com.naqashly.productivity.repository.TaskRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * <h1>Productivity Service Asynchronous Kafka Event Listener</h1>
 * 
 * <p><b>WHAT:</b> Background Kafka Consumer listening to {@code bot-commands-topic} under Consumer Group {@code productivity-consumer-group}.</p>
 * <p><b>WHY:</b> Asynchronously processes task actions (e.g., marking task complete, creating new task) published by chat bots without blocking webhooks.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 * @see KafkaListener
 */
@Component
public class ProductivityKafkaListener {

    private static final Logger log = LoggerFactory.getLogger(ProductivityKafkaListener.class);
    private final TaskRepository taskRepository;

    public ProductivityKafkaListener(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    /**
     * Asynchronous Kafka Topic Listener.
     * 
     * @param event Incoming {@link BotCommandEvent} deserialized from Kafka.
     */
    @KafkaListener(topics = "bot-commands-topic", groupId = KafkaConsumerConfig.PRODUCTIVITY_CONSUMER_GROUP)
    public void handleBotCommandEvent(BotCommandEvent event) {
        log.info("Received Kafka Event [{}] from channel [{}]: Action={}", 
                event.getEventId(), event.getChannel(), event.getAction());

        try {
            if ("MARK_TASK_COMPLETE".equalsIgnoreCase(event.getAction())) {
                Number taskIdNum = (Number) event.getParameters().get("taskId");
                if (taskIdNum != null) {
                    Long taskId = taskIdNum.longValue();
                    Long userId = event.getInternalUserId() != null ? event.getInternalUserId() : 1L;

                    Task task = taskRepository.findByIdAndUserId(taskId, userId).orElse(null);
                    if (task != null) {
                        task.setStatus(TaskStatus.COMPLETED);
                        taskRepository.save(task);
                        log.info("Successfully updated Task #{} status to COMPLETED via Kafka event [{}]", taskId, event.getEventId());
                    } else {
                        log.warn("Task #{} not found or unauthorized for user {}", taskId, userId);
                    }
                }
            } else if ("ADD_TASK".equalsIgnoreCase(event.getAction())) {
                String title = (String) event.getParameters().get("title");
                Long userId = event.getInternalUserId() != null ? event.getInternalUserId() : 1L;

                Task task = Task.builder()
                        .userId(userId)
                        .title(title)
                        .description("Created via " + event.getChannel() + " Bot Kafka Event")
                        .category("Bot Event")
                        .priority(TaskPriority.MEDIUM)
                        .status(TaskStatus.TODO)
                        .build();

                Task savedTask = taskRepository.save(task);
                log.info("Successfully created Task #{} '{}' via Kafka event [{}]", savedTask.getId(), title, event.getEventId());
            }
        } catch (Exception e) {
            log.error("Failed to process Kafka event [{}]: {}", event.getEventId(), e.getMessage(), e);
        }
    }
}
