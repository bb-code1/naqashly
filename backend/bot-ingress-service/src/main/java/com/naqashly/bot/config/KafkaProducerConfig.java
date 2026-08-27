package com.naqashly.bot.config;

import com.naqashly.bot.event.BotCommandEvent;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.support.serializer.JsonSerializer;

import java.util.HashMap;
import java.util.Map;

/**
 * <h1>Production-Grade Kafka Producer Configuration</h1>
 * 
 * <p><b>WHAT:</b> Configures Spring Kafka {@link KafkaTemplate} with JSON serialization and resilient producer properties.</p>
 * <p><b>WHY:</b> Ensures zero message loss ({@code acks = all}), idempotent delivery ({@code enable.idempotence = true}), and auto-creation of {@code bot-commands-topic}.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 * @see KafkaTemplate
 * @see BotCommandEvent
 */
@Configuration
public class KafkaProducerConfig {

    private static final String KAFKA_BOOTSTRAP_SERVERS = "localhost:9092";
    public static final String BOT_COMMANDS_TOPIC = "bot-commands-topic";

    /**
     * Auto-create Kafka Topic 'bot-commands-topic' on startup.
     */
    @Bean
    public NewTopic botCommandsTopic() {
        return TopicBuilder.name(BOT_COMMANDS_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    /**
     * Resilient Producer Factory Configuration.
     */
    @Bean
    public ProducerFactory<String, BotCommandEvent> producerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, KAFKA_BOOTSTRAP_SERVERS);
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        configProps.put(ProducerConfig.ACKS_CONFIG, "all");
        configProps.put(ProducerConfig.RETRIES_CONFIG, 3);
        configProps.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);
        return new DefaultKafkaProducerFactory<>(configProps);
    }

    /**
     * KafkaTemplate Bean for publishing BotCommandEvent messages.
     */
    @Bean
    public KafkaTemplate<String, BotCommandEvent> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }
}
