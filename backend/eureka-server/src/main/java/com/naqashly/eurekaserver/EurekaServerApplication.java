package com.naqashly.eurekaserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

/**
 * <h1>Eureka Service Discovery Server Entrypoint</h1>
 * 
 * <p><b>WHAT:</b> Central service discovery registry server for the Naqashly microservices platform.</p>
 * <p><b>WHY:</b> Microservices in a distributed cloud network frequently scale horizontally and change IP addresses or ports.
 * Eureka allows services to locate and talk to each other by service name (e.g., {@code AUTH-SERVICE}, {@code API-GATEWAY})
 * without hardcoding static IP addresses or port numbers in application code.</p>
 * <p><b>HOW:</b>
 * <ul>
 *   <li>The {@link EnableEurekaServer} annotation activates Spring Cloud Netflix Eureka Server configuration, exposing REST APIs on port 8761.</li>
 *   <li>Microservices register as Eureka Clients on boot and send periodic heartbeats (every 30s) to keep their status active.</li>
 *   <li>Spring Cloud Gateway queries this server to perform dynamic client-side load balancing via {@code lb://SERVICE-NAME}.</li>
 * </ul>
 * </p>
 * 
 * @author Naqashly Engineering Team
 * @version 1.0.0
 * @see EnableEurekaServer
 */
@SpringBootApplication
@EnableEurekaServer
public class EurekaServerApplication {

    /**
     * Main application launcher method.
     * 
     * <p><b>WHAT:</b> Bootstraps the Spring Boot application context and starts the embedded Tomcat web server.</p>
     * <p><b>WHY:</b> Standard Java application entrypoint required to launch the standalone Eureka registry process.</p>
     * <p><b>HOW:</b> Delegates initialization to {@link SpringApplication#run(Class, String...)}, scanning annotations and setting up the Eureka server context on port 8761.</p>
     * 
     * @param args Command-line arguments passed during application invocation.
     */
    public static void main(String[] args) {
        SpringApplication.run(EurekaServerApplication.class, args);
    }
}
