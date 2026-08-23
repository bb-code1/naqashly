package com.naqashly.monolith.bot.controller;

import com.naqashly.monolith.bot.service.BotEngineService;
import com.naqashly.monolith.common.response.ApiResponse;
import com.naqashly.monolith.security.SecurityUtils;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * <h1>Ask Naqash Bot REST Controller</h1>
 * 
 * <p><b>WHAT:</b> REST endpoint for conversational interactions under {@code /api/v1/bot}.</p>
 */
@RestController
@RequestMapping("/api/v1/bot")
public class BotController {

    private final BotEngineService botEngineService;

    public BotController(BotEngineService botEngineService) {
        this.botEngineService = botEngineService;
    }

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<Map<String, Object>>> chat(
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @Valid @RequestBody ChatRequest request) {

        Long userId = headerUserId != null ? headerUserId : SecurityUtils.getCurrentUserId();

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("UNAUTHORIZED", "User authentication required."));
        }

        Map<String, Object> result = botEngineService.processMessage(userId, request.getMessage(), request.getContext(), request.getMeta());
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Data
    public static class ChatRequest {
        @NotBlank(message = "Message content is required")
        private String message;

        private String context;

        private Map<String, Object> meta;
    }
}
