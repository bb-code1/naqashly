package com.naqashly.bot.config;

import org.springframework.cloud.circuitbreaker.resilience4j.Resilience4JCircuitBreakerFactory;
import org.springframework.cloud.client.circuitbreaker.Customizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Collections;
import java.util.List;
import java.util.concurrent.AbstractExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * <h1>Resilience4jConfig</h1>
 * 
 * <p><b>WHAT:</b> Customizer configuration for the Resilience4j Circuit Breaker factory.</p>
 * <p><b>WHY:</b> Configures Feign circuit breakers to execute on the calling thread. This preserves the ThreadLocal 
 * context (like X-User-Id user identity headers) during outgoing microservice calls without thread switching.</p>
 */
@Configuration
public class Resilience4jConfig {

    @Bean
    public Customizer<Resilience4JCircuitBreakerFactory> defaultCustomizer() {
        return factory -> {
            // Configure a synchronous executor service to run Feign calls in the caller thread.
            // This prevents context drop of ThreadLocals like SecurityContext or UserContextHolder.
            factory.configureExecutorService(new AbstractExecutorService() {
                private boolean shutdown = false;

                @Override
                public void shutdown() {
                    shutdown = true;
                }

                @Override
                public List<Runnable> shutdownNow() {
                    shutdown = true;
                    return Collections.emptyList();
                }

                @Override
                public boolean isShutdown() {
                    return shutdown;
                }

                @Override
                public boolean isTerminated() {
                    return shutdown;
                }

                @Override
                public boolean awaitTermination(long timeout, TimeUnit unit) {
                    return true;
                }

                @Override
                public void execute(Runnable command) {
                    command.run();
                }
            });
        };
    }
}
