package com.naqashly.finance.config;

import com.naqashly.finance.event.BotCommandEvent;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.support.serializer.JsonDeserializer;

import java.util.HashMap;
import java.util.Map;

/**
 * <h1>Production-Grade Kafka Consumer Configuration for Finance Service</h1>
 * 
 * <p><b>WHAT:</b> Configures Spring Kafka {@link ConcurrentKafkaListenerContainerFactory} with JSON deserialization for {@code finance-consumer-group}.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 * @see EnableKafka
 */
@Configuration
@EnableKafka
public class KafkaConsumerConfig {

    private static final String KAFKA_BOOTSTRAP_SERVERS = "localhost:9092";
    public static final String FINANCE_CONSUMER_GROUP = "finance-consumer-group";

    @Bean
    public ConsumerFactory<String, BotCommandEvent> consumerFactory() {
        JsonDeserializer<BotCommandEvent> deserializer = new JsonDeserializer<>(BotCommandEvent.class);
        deserializer.setRemoveTypeHeaders(false);
        deserializer.addTrustedPackages("*");
        deserializer.setUseTypeMapperForKey(true);

        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, KAFKA_BOOTSTRAP_SERVERS);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, FINANCE_CONSUMER_GROUP);
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, deserializer);
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");

        return new DefaultKafkaConsumerFactory<>(props, new StringDeserializer(), deserializer);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, BotCommandEvent> kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, BotCommandEvent> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());
        return factory;
    }
}
