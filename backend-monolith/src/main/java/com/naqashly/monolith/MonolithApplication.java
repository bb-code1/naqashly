package com.naqashly.monolith;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * <h1>Naqashly Life OS — Unified Modular Monolith Launcher</h1>
 * 
 * <p><b>WHAT:</b> Main entry point for the single-JVM Modular Monolith executing all core domains (Auth, Routine, Productivity, Journal, Finance, Bot) on Port 8080.</p>
 * <p><b>WHY:</b> Eliminates multi-JVM overhead, removes distributed network latency, and drastically simplifies local and cloud operation.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@SpringBootApplication
@EnableAsync
@EnableTransactionManagement
public class MonolithApplication {

    public static void main(String[] args) {
        SpringApplication.run(MonolithApplication.class, args);
    }
}
