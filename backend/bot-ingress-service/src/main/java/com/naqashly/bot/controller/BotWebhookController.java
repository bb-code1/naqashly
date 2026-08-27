package com.naqashly.bot.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.naqashly.bot.service.BotDispatcherService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * <h1>Multi-Channel Chat Bot Ingress Webhook Controller</h1>
 * 
 * <p><b>WHAT:</b> Universal REST API endpoint intercepting HTTP POST webhooks from Telegram, WhatsApp, Slack, or generic custom chat channels.</p>
 * <p><b>WHY:</b> Serves as the single unified ingress gateway for external messaging webhooks under {@code /api/v1/bot/webhook/{channel}}.</p>
 * <p><b>HOW:</b> Delegates payload parsing and intent execution to {@link BotDispatcherService} and returns instant 200 OK responses to chat providers.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 * @see BotDispatcherService
 */
@RestController
@RequestMapping("/api/v1/bot/webhook")
public class BotWebhookController {

    private final BotDispatcherService dispatcherService;

    public BotWebhookController(BotDispatcherService dispatcherService) {
        this.dispatcherService = dispatcherService;
    }

    /**
     * Universal Channel Webhook Receiver Endpoint.
     * 
     * @param channel Channel provider path variable ("telegram", "whatsapp", "slack", "custom").
     * @param rawPayload Raw Jackson {@link JsonNode} representing the incoming webhook body.
     * @return ResponseEntity with 200 OK status and dispatch execution response.
     */
    @PostMapping("/{channel}")
    public ResponseEntity<Map<String, Object>> handleChannelWebhook(@PathVariable String channel,
                                                                    @RequestBody JsonNode rawPayload) {
        Map<String, Object> result = dispatcherService.processWebhook(channel, rawPayload);
        return ResponseEntity.ok(result);
    }
}
