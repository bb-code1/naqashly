package com.naqashly.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * <h1>Async Configuration</h1>
 * 
 * <p><b>WHAT:</b> Configures a managed task executor thread pool for Spring's {@code @Async} processing.</p>
 * <p><b>WHY:</b> Reuses OS threads responsibly during asynchronous operations (like email sending) to prevent memory leakage or OOM crashes under high registration concurrency.</p>
 */
@Configuration
public class AsyncConfig implements AsyncConfigurer {

    @Override
    @Bean(name = "taskExecutor")
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(16);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("AsyncMail-");
        executor.initialize();
        return executor;
    }
}
