package com.naqashly.bot.controller;

import com.naqashly.bot.model.BotChatRequest;
import com.naqashly.bot.model.BotChatResponse;
import com.naqashly.bot.service.BotChatService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/bot")
public class BotChatController {

    private final BotChatService botChatService;

    public BotChatController(BotChatService botChatService) {
        this.botChatService = botChatService;
    }

    /**
     * Interactive Guided Conversational Bot Endpoint for Web Clients.
     * 
     * @param userIdHeader Injected X-User-Id header representing authenticated user.
     * @param request BotChatRequest payload.
     * @return BotChatResponse containing chat feedback and interactive DTO.
     */
    @PostMapping("/chat")
    public ResponseEntity<BotChatResponse> chat(@RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
                                                @RequestBody BotChatRequest request) {
        if (userIdHeader == null || userIdHeader.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(BotChatResponse.builder()
                            .status("ERROR")
                            .text("Unauthorized request. Missing user identity header.")
                            .build());
        }

        BotChatResponse response = botChatService.processWebChat(userIdHeader, request);
        return ResponseEntity.ok(response);
    }
}
