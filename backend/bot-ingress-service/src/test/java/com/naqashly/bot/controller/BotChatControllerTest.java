package com.naqashly.bot.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.naqashly.bot.model.BotChatRequest;
import com.naqashly.bot.model.BotChatResponse;
import com.naqashly.bot.service.BotChatService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(BotChatController.class)
public class BotChatControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BotChatService botChatService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testChatUnauthorizedMissingHeader() throws Exception {
        BotChatRequest request = BotChatRequest.builder()
                .message("Hello")
                .context("WELCOME")
                .build();

        mockMvc.perform(post("/api/v1/bot/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value("ERROR"))
                .andExpect(jsonPath("$.text").value("Unauthorized request. Missing user identity header."));
    }

    @Test
    public void testChatAuthorizedSuccess() throws Exception {
        BotChatRequest request = BotChatRequest.builder()
                .message("Hello")
                .context("WELCOME")
                .build();

        BotChatResponse expectedResponse = BotChatResponse.builder()
                .status("SUCCESS")
                .type("text")
                .text("Welcome back!")
                .context("WELCOME")
                .build();

        when(botChatService.processWebChat(eq("user_123"), any(BotChatRequest.class)))
                .thenReturn(expectedResponse);

        mockMvc.perform(post("/api/v1/bot/chat")
                        .header("X-User-Id", "user_123")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.text").value("Welcome back!"))
                .andExpect(jsonPath("$.context").value("WELCOME"));
    }
}
