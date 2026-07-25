package com.naqashly.routine;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * <h1>Routine & Habit Management Microservice Entry Point</h1>
 * 
 * <p><b>WHAT:</b> Spring Boot 3.3.2 microservice running on Port 8085 dedicated to universal routine blocks, multi-profile templates, streak math (with 2-hour grace windows), and habit auditing.</p>
 * <p><b>WHY:</b> Decouples routine scheduling and habit habit tracking from core domain microservices while remaining 100% agnostic to any single religion or culture.</p>
 * 
 * <h2>Key Responsibilities:</h2>
 * <ul>
 *   <li>Manages user-defined time-bounded {@code RoutineBlock} schedules.</li>
 *   <li>Provides template blueprints (Secular, Mindfulness, Custom, Faith presets).</li>
 *   <li>Calculates habit streaks with 2-hour midnight grace windows & monthly freeze passes.</li>
 *   <li>Consumes Kafka habit events from chat bots asynchronously.</li>
 * </ul>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 * @see EnableDiscoveryClient
 */
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableDiscoveryClient
@EnableAsync
public class RoutineServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(RoutineServiceApplication.class, args);
    }
}
