package com.naqashly.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * <h1>Spring Cloud API Gateway Entrypoint</h1>
 * 
 * <p><b>WHAT:</b> Central Edge Gateway and Reverse Proxy for all external client traffic entering the Naqashly microservices platform on port 8080.</p>
 * <p><b>WHY:</b> Direct exposure of microservices to the public internet creates security risks, complex CORS configurations, and tight coupling.
 * The API Gateway acts as a single unified entry point (BFF - Backend for Frontend) responsible for routing requests, RS256 JWT validation, rate limiting, and request transformation.</p>
 * <p><b>HOW:</b>
 * <ul>
 *   <li>Built on <b>Spring WebFlux (Project Reactor / Netty)</b> for non-blocking asynchronous event-driven HTTP request routing.</li>
 *   <li>Uses {@link EnableDiscoveryClient} to query {@code eureka-server} (Port 8761) and resolve dynamic URI routing predicates (e.g., {@code lb://AUTH-SERVICE}).</li>
 *   <li>Filters incoming requests, executes global security rules, and injects downstream headers ({@code X-User-Id}, {@code X-User-Email}).</li>
 * </ul>
 * </p>
 * 
 * @author Naqashly Engineering Team
 * @version 1.0.0
 * @see EnableDiscoveryClient
 */
@SpringBootApplication
@EnableDiscoveryClient
public class ApiGatewayApplication {

    /**
     * Main application launcher for the Reactive API Gateway.
     * 
     * <p><b>WHAT:</b> Starts the non-blocking Netty web server on port 8080 and initializes gateway route locator beans.</p>
     * <p><b>WHY:</b> Required Java main entrypoint to spin up the API Gateway reactive application context.</p>
     * <p><b>HOW:</b> Calls {@link SpringApplication#run(Class, String...)}, registering with Eureka server and establishing reactive Netty event loops.</p>
     * 
     * @param args Command-line arguments.
     */
    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}
