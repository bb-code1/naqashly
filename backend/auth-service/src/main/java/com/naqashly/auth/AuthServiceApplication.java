package com.naqashly.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * <h1>Authentication & Identity Microservice Entrypoint</h1>
 * 
 * <p><b>WHAT:</b> Core identity management, user authentication, and cryptographic token authority for the Naqashly platform (Port 8081).</p>
 * <p><b>WHY:</b> Centralizing user credentials, RS256 JWT key management, JWKS public key distribution, and password hashing in an isolated microservice
 * guarantees security best practices, zero shared-database anti-patterns, and independent scalability.</p>
 * <p><b>HOW:</b>
 * <ul>
 *   <li>Configured with Spring Data JPA to connect to PostgreSQL container ({@code naqashly_auth_db} on host port 5433).</li>
 *   <li>Uses {@link EnableDiscoveryClient} to register as {@code AUTH-SERVICE} with Eureka server (Port 8761).</li>
 *   <li>Generates an in-memory 2048-bit RSA key pair on startup for signing RS256 JWT tokens and serving JWKS key sets.</li>
 * </ul>
 * </p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 * @see EnableDiscoveryClient
 */
@SpringBootApplication
@EnableDiscoveryClient
public class AuthServiceApplication {

    /**
     * Main application launcher for the Auth Service.
     * 
     * <p><b>WHAT:</b> Initializes Spring context, embedded Tomcat web server on port 8081, Hibernate JPA, and RSA key pairs.</p>
     * <p><b>WHY:</b> Standard Java entrypoint required to run the Auth microservice.</p>
     * <p><b>HOW:</b> Triggers {@link SpringApplication#run(Class, String...)}, scanning components under {@code com.naqashly.auth} package.</p>
     * 
     * @param args Command-line arguments.
     */
    public static void main(String[] args) {
        SpringApplication.run(AuthServiceApplication.class, args);
    }
}
