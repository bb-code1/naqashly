package com.naqashly.productivity;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * <h1>Productivity & Task Management Microservice Entrypoint</h1>
 * 
 * <p><b>WHAT:</b> Core productivity management microservice responsible for task tracking, status management, priority queues, and Telegram/WhatsApp message integration hooks (Port 8083).</p>
 * <p><b>WHY:</b> Isolating task management into a dedicated domain service ensures database isolation (Database-per-Service pattern on {@code naqashly_productivity_db}) and allows asynchronous messaging events from chat bots to update task states without touching auth or finance systems.</p>
 * <p><b>HOW:</b>
 * <ul>
 *   <li>Connects to PostgreSQL container ({@code naqashly_productivity_db} on host port 5433).</li>
 *   <li>Registers as {@code PRODUCTIVITY-SERVICE} with Eureka Discovery Server (Port 8761).</li>
 *   <li>Consumes {@code X-User-Id} and {@code X-User-Email} HTTP headers propagated by {@code api-gateway}.</li>
 * </ul>
 * </p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 * @see EnableDiscoveryClient
 */
@SpringBootApplication
@EnableDiscoveryClient
public class ProductivityServiceApplication {

    /**
     * Main application launcher for the Productivity Microservice.
     * 
     * @param args Command-line arguments.
     */
    public static void main(String[] args) {
        SpringApplication.run(ProductivityServiceApplication.class, args);
    }
}
