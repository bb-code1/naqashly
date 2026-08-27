package com.naqashly.journal.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.naqashly.journal.entity.Note;
import com.naqashly.journal.service.JournalService;
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

@WebMvcTest(JournalController.class)
public class JournalControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JournalService journalService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testGetNotesUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/journal/notes"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void testGetNotesSuccess() throws Exception {
        Note note = Note.builder()
                .id(1L)
                .userId(100L)
                .title("Ideas")
                .content("Build a startup")
                .category("IDEAS")
                .isPinned(false)
                .isEncrypted(false)
                .build();

        when(journalService.getUserNotes(100L, null)).thenReturn(List.of(note));

        mockMvc.perform(get("/api/v1/journal/notes")
                        .header("X-User-Id", "100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].title").value("Ideas"));
    }

    @Test
    public void testCreateNoteSuccess() throws Exception {
        Map<String, Object> request = new HashMap<>();
        request.put("title", "Daily Log");
        request.put("content", "Today was productive");
        request.put("category", "WORK");
        request.put("isPinned", false);
        request.put("isEncrypted", false);

        Note savedNote = Note.builder()
                .id(2L)
                .userId(100L)
                .title("Daily Log")
                .content("Today was productive")
                .category("WORK")
                .isPinned(false)
                .isEncrypted(false)
                .build();

        when(journalService.createNote(eq(100L), eq("Daily Log"), eq("Today was productive"), eq("WORK"),
                eq(false), eq(false), any(), any(), any(), any()))
                .thenReturn(savedNote);

        mockMvc.perform(post("/api/v1/journal/notes")
                        .header("X-User-Id", "100")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(2))
                .andExpect(jsonPath("$.title").value("Daily Log"))
                .andExpect(jsonPath("$.category").value("WORK"));
    }
}
