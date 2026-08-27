package com.naqashly.finance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * <h1>Finance & Financial Wallet Microservice Entrypoint</h1>
 * 
 * <p><b>WHAT:</b> Financial management microservice responsible for tracking user wallets, currency balances, income, expenses, and transaction ledgers (Port 8082).</p>
 * <p><b>WHY:</b> Isolating financial data into a dedicated domain service guarantees database isolation (Database-per-Service pattern on {@code naqashly_finance_db}), prevents accidental cross-domain data corruption, and allows independent horizontal scaling.</p>
 * <p><b>HOW:</b>
 * <ul>
 *   <li>Connects to PostgreSQL container ({@code naqashly_finance_db} on host port 5433).</li>
 *   <li>Uses {@link EnableDiscoveryClient} to register as {@code FINANCE-SERVICE} with Eureka server (Port 8761).</li>
 *   <li>Reads user identity headers ({@code X-User-Id}, {@code X-User-Email}) injected by {@code api-gateway} to contextualize requests without making duplicate authentication calls.</li>
 * </ul>
 * </p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 * @see EnableDiscoveryClient
 */
@SpringBootApplication
@EnableDiscoveryClient
public class FinanceServiceApplication {

    /**
     * Main application launcher for the Finance Microservice.
     * 
     * @param args Command-line arguments.
     */
    public static void main(String[] args) {
        SpringApplication.run(FinanceServiceApplication.class, args);
    }
}
