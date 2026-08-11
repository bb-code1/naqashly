package com.naqashly.bot.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * <h1>Asynchronous Processing Configuration</h1>
 */
@Configuration
@EnableAsync
@org.springframework.retry.annotation.EnableRetry
public class AsyncConfig {

    @Bean(name = "botTaskExecutor")
    public Executor botTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("BotAsync-");
        executor.initialize();
        return executor;
    }
}
