package com.naqashly.routine.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.naqashly.routine.entity.MuhasabahLog;
import com.naqashly.routine.repository.MuhasabahLogRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(MuhasabahController.class)
public class MuhasabahControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MuhasabahLogRepository muhasabahLogRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testGetMuhasabahHistorySuccess() throws Exception {
        MuhasabahLog log1 = MuhasabahLog.builder()
                .id(1L)
                .userId(100L)
                .logDate(LocalDate.now().minusDays(1))
                .mood("GOOD")
                .dailyWin("Completed task list")
                .topBlocker("None")
                .muhasabahGrade("A")
                .build();

        when(muhasabahLogRepository.findByUserIdOrderByLogDateDesc(100L)).thenReturn(List.of(log1));

        mockMvc.perform(get("/api/v1/routine/muhasabah/history")
                        .header("X-User-Id", "100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].mood").value("GOOD"))
                .andExpect(jsonPath("$[0].muhasabahGrade").value("A"));
    }

    @Test
    public void testSaveMuhasabahSuccess() throws Exception {
        MuhasabahLog requestLog = MuhasabahLog.builder()
                .mood("EXCELLENT")
                .dailyWin("Did 100 pushups")
                .topBlocker("Procrastination")
                .muhasabahGrade("B")
                .build();

        MuhasabahLog savedLog = MuhasabahLog.builder()
                .id(2L)
                .userId(100L)
                .logDate(LocalDate.now())
                .mood("EXCELLENT")
                .dailyWin("Did 100 pushups")
                .topBlocker("Procrastination")
                .muhasabahGrade("B")
                .build();

        when(muhasabahLogRepository.findByUserIdAndLogDate(eq(100L), any(LocalDate.class)))
                .thenReturn(Optional.empty());
        when(muhasabahLogRepository.save(any(MuhasabahLog.class))).thenReturn(savedLog);

        mockMvc.perform(post("/api/v1/routine/muhasabah")
                        .header("X-User-Id", "100")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestLog)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(2))
                .andExpect(jsonPath("$.mood").value("EXCELLENT"));
    }
}
