package com.naqashly.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.naqashly.auth.entity.User;
import com.naqashly.auth.repository.UserRepository;
import com.naqashly.auth.repository.VerificationTokenRepository;
import com.naqashly.auth.security.JwtTokenProvider;
import com.naqashly.auth.service.EmailService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private VerificationTokenRepository verificationTokenRepository;

    @MockBean
    private EmailService emailService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testRegisterUserSuccess() throws Exception {
        Map<String, String> request = new HashMap<>();
        request.put("email", "newuser@test.com");
        request.put("password", "Password123!");
        request.put("name", "New User");

        when(userRepository.findByEmail("newuser@test.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode(any(CharSequence.class))).thenReturn("hashed_password");
        
        User mockUser = new User();
        mockUser.setId(1L);
        mockUser.setEmail("newuser@test.com");
        mockUser.setName("New User");
        when(userRepository.save(any(User.class))).thenReturn(mockUser);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("User registered successfully. Please check your email to verify your account."));
    }

    @Test
    public void testRegisterUserAlreadyExists() throws Exception {
        Map<String, String> request = new HashMap<>();
        request.put("email", "existing@test.com");
        request.put("password", "Password123!");
        request.put("name", "Existing User");

        User existingUser = new User();
        existingUser.setId(2L);
        existingUser.setEmail("existing@test.com");
        existingUser.setEmailVerified(true);

        when(userRepository.findByEmail("existing@test.com")).thenReturn(Optional.of(existingUser));

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Email is already registered"));
    }

    @Test
    public void testLoginUserSuccess() throws Exception {
        Map<String, String> request = new HashMap<>();
        request.put("email", "user@test.com");
        request.put("password", "Password123!");

        User mockUser = new User();
        mockUser.setId(3L);
        mockUser.setEmail("user@test.com");
        mockUser.setName("Test User");
        mockUser.setPasswordHash("hashed_password");
        mockUser.setEmailVerified(true);

        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches(any(CharSequence.class), any(String.class))).thenReturn(true);
        when(jwtTokenProvider.generateAccessToken(any(User.class))).thenReturn("mock_jwt_token");
        when(jwtTokenProvider.generateRefreshToken()).thenReturn("mock_refresh_token");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.access_token").value("mock_jwt_token"))
                .andExpect(jsonPath("$.token_type").value("Bearer"));
    }

    @Test
    public void testLoginUserInvalidCredentials() throws Exception {
        Map<String, String> request = new HashMap<>();
        request.put("email", "user@test.com");
        request.put("password", "WrongPassword!");

        User mockUser = new User();
        mockUser.setId(3L);
        mockUser.setEmail("user@test.com");
        mockUser.setName("Test User");
        mockUser.setPasswordHash("hashed_password");
        mockUser.setEmailVerified(true);

        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches(any(CharSequence.class), any(String.class))).thenReturn(false);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }
}
