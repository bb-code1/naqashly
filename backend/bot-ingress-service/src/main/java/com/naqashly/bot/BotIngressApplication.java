package com.naqashly.bot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

/**
 * <h1>Multi-Channel Chat Bot Ingress Microservice Entrypoint</h1>
 * 
 * <p><b>WHAT:</b> Extensible Chat Bot Ingress & Intent Engine microservice (Port 8084) handling real-time webhooks from Telegram, WhatsApp, Slack, or custom chat channels.</p>
 * <p><b>WHY:</b> Centralizing chat bot webhook ingress and message normalization prevents chat platforms from directly coupling with core domain microservices (e.g. {@code productivity-service}, {@code finance-service}).</p>
 * <p><b>HOW:</b>
 * <ul>
 *   <li>Uses the <b>Adapter Pattern</b> to translate platform-specific payloads (Telegram Update, WhatsApp Webhook) into a unified {@link com.naqashly.bot.model.BotMessageEvent}.</li>
 *   <li>Uses the <b>Strategy Pattern</b> via {@link com.naqashly.bot.parser.IntentParser} to classify raw text into structured intents.</li>
 *   <li>Registers with Eureka Discovery Server as {@code BOT-INGRESS-SERVICE}.</li>
 * </ul>
 * </p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 * @see EnableDiscoveryClient
 */
@SpringBootApplication
@EnableDiscoveryClient
public class BotIngressApplication {

    /**
     * Main application launcher for the Bot Ingress Microservice.
     * 
     * @param args Command-line arguments.
     */
    public static void main(String[] args) {
        SpringApplication.run(BotIngressApplication.class, args);
    }

    /**
     * RestTemplate Bean for downstream HTTP service invocation.
     * 
     * @return New {@link RestTemplate} instance.
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
