package com.naqashly.productivity.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.naqashly.productivity.entity.Goal;
import com.naqashly.productivity.entity.GoalCategory;
import com.naqashly.productivity.entity.TimelineLevel;
import com.naqashly.productivity.entity.TaskPriority;
import com.naqashly.productivity.repository.GoalRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(GoalController.class)
public class GoalControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private GoalRepository goalRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testGetUserGoalsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/productivity/goals"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void testGetUserGoalsSuccess() throws Exception {
        Goal goal = Goal.builder()
                .id(1L)
                .userId(100L)
                .title("Save Money")
                .category(GoalCategory.FINANCES)
                .timelineLevel(TimelineLevel.YEARLY)
                .priority(TaskPriority.HIGH)
                .progressPercentage(10)
                .isCompleted(false)
                .build();

        when(goalRepository.findByUserIdOrderByCreatedAtDesc(100L)).thenReturn(List.of(goal));

        mockMvc.perform(get("/api/v1/productivity/goals")
                        .header("X-User-Id", "100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].id").value(1))
                .andExpect(jsonPath("$.data[0].title").value("Save Money"));
    }

    @Test
    public void testCreateGoalSuccess() throws Exception {
        Map<String, Object> request = new HashMap<>();
        request.put("title", "Run Marathon");
        request.put("category", "HEALTH");
        request.put("timelineLevel", "YEARLY");
        request.put("description", "Train for 42km");
        request.put("priority", "HIGH");

        Goal savedGoal = Goal.builder()
                .id(5L)
                .userId(100L)
                .title("Run Marathon")
                .category(GoalCategory.HEALTH)
                .timelineLevel(TimelineLevel.YEARLY)
                .priority(TaskPriority.HIGH)
                .isCompleted(false)
                .progressPercentage(0)
                .targetDate(LocalDate.now().plusDays(10))
                .build();

        when(goalRepository.save(any(Goal.class))).thenReturn(savedGoal);

        mockMvc.perform(post("/api/v1/productivity/goals")
                        .header("X-User-Id", "100")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(5))
                .andExpect(jsonPath("$.title").value("Run Marathon"));
    }
}
