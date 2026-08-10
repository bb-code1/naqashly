package com.naqashly.productivity.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.naqashly.productivity.entity.Task;
import com.naqashly.productivity.entity.TaskPriority;
import com.naqashly.productivity.entity.TaskStatus;
import com.naqashly.productivity.controller.TaskController.CreateTaskRequest;
import com.naqashly.productivity.controller.TaskController.UpdateStatusRequest;
import com.naqashly.productivity.repository.TaskRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TaskController.class)
public class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TaskRepository taskRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testGetUserTasksUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/productivity/tasks"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void testGetUserTasksSuccess() throws Exception {
        Task task = Task.builder()
                .id(1L)
                .userId(100L)
                .title("Complete Assignment")
                .description("Math Homework")
                .category("Education")
                .priority(TaskPriority.HIGH)
                .status(TaskStatus.TODO)
                .build();

        when(taskRepository.findByUserIdOrderByCreatedAtDesc(100L)).thenReturn(List.of(task));

        mockMvc.perform(get("/api/v1/productivity/tasks")
                        .header("X-User-Id", "100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].title").value("Complete Assignment"))
                .andExpect(jsonPath("$[0].status").value("TODO"));
    }

    @Test
    public void testCreateTaskSuccess() throws Exception {
        CreateTaskRequest request = new CreateTaskRequest();
        request.setTitle("Write Report");
        request.setDescription("Monthly sales summary");
        request.setCategory("Work");
        request.setPriority(TaskPriority.MEDIUM);

        Task savedTask = Task.builder()
                .id(2L)
                .userId(100L)
                .title("Write Report")
                .description("Monthly sales summary")
                .category("Work")
                .priority(TaskPriority.MEDIUM)
                .status(TaskStatus.TODO)
                .build();

        when(taskRepository.save(any(Task.class))).thenReturn(savedTask);

        mockMvc.perform(post("/api/v1/productivity/tasks")
                        .header("X-User-Id", "100")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(2))
                .andExpect(jsonPath("$.title").value("Write Report"))
                .andExpect(jsonPath("$.status").value("TODO"));
    }

    @Test
    public void testUpdateTaskStatusSuccess() throws Exception {
        UpdateStatusRequest request = new UpdateStatusRequest();
        request.setStatus(TaskStatus.COMPLETED);

        Task task = Task.builder()
                .id(1L)
                .userId(100L)
                .title("Complete Assignment")
                .status(TaskStatus.TODO)
                .build();

        Task updatedTask = Task.builder()
                .id(1L)
                .userId(100L)
                .title("Complete Assignment")
                .status(TaskStatus.COMPLETED)
                .build();

        when(taskRepository.findByIdAndUserId(1L, 100L)).thenReturn(Optional.of(task));
        when(taskRepository.save(any(Task.class))).thenReturn(updatedTask);

        mockMvc.perform(put("/api/v1/productivity/tasks/1/status")
                        .header("X-User-Id", "100")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));
    }
}
