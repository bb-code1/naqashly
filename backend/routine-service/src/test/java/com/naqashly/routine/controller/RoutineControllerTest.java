package com.naqashly.routine.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.naqashly.routine.entity.UserRoutine;
import com.naqashly.routine.service.RoutineService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RoutineController.class)
public class RoutineControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RoutineService routineService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testGetUserRoutinesUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/routine/routines"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void testGetUserRoutinesSuccess() throws Exception {
        UserRoutine routine = UserRoutine.builder()
                .id(1L)
                .userId(100L)
                .title("Morning Rituals")
                .isActive(true)
                .build();

        when(routineService.getUserRoutines(100L)).thenReturn(List.of(routine));

        mockMvc.perform(get("/api/v1/routine/routines")
                        .header("X-User-Id", "100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].id").value(1))
                .andExpect(jsonPath("$.data[0].title").value("Morning Rituals"));
    }

    @Test
    public void testCreateRoutineSuccess() throws Exception {
        Map<String, String> request = new HashMap<>();
        request.put("title", "Night Rituals");
        request.put("preset", "SECULAR");
        request.put("daysOfWeek", "MON,TUE");

        UserRoutine savedRoutine = UserRoutine.builder()
                .id(2L)
                .userId(100L)
                .title("Night Rituals")
                .isActive(false)
                .build();

        when(routineService.createRoutineFromPreset(eq(100L), eq("Night Rituals"), eq("SECULAR"), eq("MON,TUE")))
                .thenReturn(savedRoutine);

        mockMvc.perform(post("/api/v1/routine/routines")
                        .header("X-User-Id", "100")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(2))
                .andExpect(jsonPath("$.data.title").value("Night Rituals"));
    }
}
