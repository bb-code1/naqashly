package com.naqashly.bot.client;

import com.naqashly.bot.client.fallback.ProductivityClientFallback;
import com.naqashly.bot.model.CreateTaskRequest;
import com.naqashly.bot.model.TaskDto;
import com.naqashly.bot.model.UpdateStatusRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "productivity-service", url = "${app.services.productivity-url:}", fallback = ProductivityClientFallback.class)
public interface ProductivityClient {

    @GetMapping("/api/v1/productivity/tasks")
    List<TaskDto> getTasks();

    @PostMapping("/api/v1/productivity/tasks")
    TaskDto createTask(@RequestBody CreateTaskRequest request);

    @PutMapping("/api/v1/productivity/tasks/{id}/status")
    TaskDto updateTaskStatus(@PathVariable("id") Long id, @RequestBody UpdateStatusRequest request);
}
