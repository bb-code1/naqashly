package com.naqashly.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.naqashly.auth.entity.TelegramLinkCode;
import com.naqashly.auth.entity.User;
import com.naqashly.auth.repository.TelegramLinkCodeRepository;
import com.naqashly.auth.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TelegramAuthController.class)
@AutoConfigureMockMvc(addFilters = false)
public class TelegramAuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private TelegramLinkCodeRepository linkCodeRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testGetTelegramProfileNotFound() throws Exception {
        when(userRepository.findByTelegramChatId(12345L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/v1/auth/telegram/user-by-chat/12345"))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testGetTelegramProfileSuccess() throws Exception {
        User user = new User();
        user.setId(10L);
        user.setEmail("test@naqashly.com");
        user.setName("Telegram User");
        user.setTelegramChatId(12345L);
        user.setTelegramContext("WELCOME");
        user.setTelegramMeta("{}");

        when(userRepository.findByTelegramChatId(12345L)).thenReturn(Optional.of(user));

        mockMvc.perform(get("/api/v1/auth/telegram/user-by-chat/12345"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(10))
                .andExpect(jsonPath("$.telegramContext").value("WELCOME"));
    }

    @Test
    public void testVerifyCodeSuccess() throws Exception {
        User user = new User();
        user.setId(10L);
        user.setName("Linked User");
        user.setEmail("user@test.com");

        TelegramLinkCode linkCode = TelegramLinkCode.builder()
                .code("CODE123")
                .user(user)
                .expiryDate(ZonedDateTime.now().plusMinutes(10))
                .build();

        when(linkCodeRepository.findById("CODE123")).thenReturn(Optional.of(linkCode));
        when(userRepository.save(any(User.class))).thenReturn(user);

        mockMvc.perform(post("/api/v1/auth/telegram/verify")
                        .param("chatId", "12345")
                        .param("code", "CODE123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.email").value("user@test.com"));
    }

    @Test
    public void testVerifyCodeInvalid() throws Exception {
        when(linkCodeRepository.findById("WRONG_CODE")).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/v1/auth/telegram/verify")
                        .param("chatId", "12345")
                        .param("code", "WRONG_CODE"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid or expired link code. Please try again."));
    }

    @Test
    public void testUpdateStateSuccess() throws Exception {
        User user = new User();
        user.setId(10L);
        user.setTelegramChatId(12345L);

        when(userRepository.findByTelegramChatId(12345L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        mockMvc.perform(post("/api/v1/auth/telegram/update-state")
                        .param("chatId", "12345")
                        .param("context", "AWAITING_EXPENSE_AMOUNT")
                        .param("meta", "{\"amount\":\"50\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"));
    }
}
