package com.naqashly.bot.client.fallback;

import com.naqashly.bot.client.ProductivityClient;
import com.naqashly.bot.model.CreateTaskRequest;
import com.naqashly.bot.model.TaskDto;
import com.naqashly.bot.model.UpdateStatusRequest;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class ProductivityClientFallback implements ProductivityClient {

    @Override
    public List<TaskDto> getTasks(String status) {
        log.warn("Productivity service is offline. Returning empty tasks list.");
        return Collections.emptyList();
    }

    @Override
    public TaskDto createTask(CreateTaskRequest request) {
        log.error("Productivity service is offline. Cannot create task: {}", request.getTitle());
        throw new IllegalStateException("Productivity service is currently offline. Cannot create task.");
    }

    @Override
    public TaskDto updateTaskStatus(Long id, UpdateStatusRequest request) {
        log.error("Productivity service is offline. Cannot update task #{} status to: {}", id, request.getStatus());
        throw new IllegalStateException("Productivity service is currently offline. Cannot update task status.");
    }

    @Override
    public Map<String, Object> deleteTask(Long id) {
        log.error("Productivity service is offline. Cannot delete task #{}", id);
        throw new IllegalStateException("Productivity service is currently offline. Cannot delete task.");
    }
}
