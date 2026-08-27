package com.naqashly.bot.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.naqashly.bot.client.AuthClient;
import com.naqashly.bot.client.TelegramClient;
import com.naqashly.bot.model.BotChatRequest;
import com.naqashly.bot.model.BotChatResponse;
import com.naqashly.bot.service.BotChatService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * <h1>TelegramWebhookController</h1>
 * 
 * <p><b>WHAT:</b> Webhook listener mapping incoming messages and callbacks from Telegram's servers.</p>
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/bot/telegram")
public class TelegramWebhookController {

    private final TelegramClient telegramClient;
    private final AuthClient authClient;
    private final BotChatService botChatService;
    private final ObjectMapper objectMapper;

    @Value("${app.telegram.bot-token}")
    private String botToken;

    public TelegramWebhookController(TelegramClient telegramClient,
                                     AuthClient authClient,
                                     BotChatService botChatService,
                                     ObjectMapper objectMapper) {
        this.telegramClient = telegramClient;
        this.authClient = authClient;
        this.botChatService = botChatService;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> handleWebhook(@RequestBody Map<String, Object> update) {
        log.info("Received Telegram webhook update payload");
        try {
            Long chatId = null;
            String text = null;

            // 1. Parse message text and chatId based on message type
            if (update.containsKey("message")) {
                Map<String, Object> message = (Map<String, Object>) update.get("message");
                if (message != null && message.containsKey("chat") && message.containsKey("text")) {
                    Map<String, Object> chat = (Map<String, Object>) message.get("chat");
                    chatId = Long.valueOf(chat.get("id").toString());
                    text = String.valueOf(message.get("text")).trim();
                }
            } else if (update.containsKey("callback_query")) {
                Map<String, Object> callbackQuery = (Map<String, Object>) update.get("callback_query");
                if (callbackQuery != null && callbackQuery.containsKey("message") && callbackQuery.containsKey("data")) {
                    Map<String, Object> message = (Map<String, Object>) callbackQuery.get("message");
                    Map<String, Object> chat = (Map<String, Object>) message.get("chat");
                    chatId = Long.valueOf(chat.get("id").toString());
                    text = String.valueOf(callbackQuery.get("data")).trim();
                }
            }

            if (chatId == null || text == null || text.isBlank()) {
                return ResponseEntity.ok().build(); // Ignore non-text actions
            }

            // 2. Handle deep linking code activation
            if (text.startsWith("/start")) {
                String code = text.replace("/start", "").trim();
                if (code.isBlank()) {
                    sendInstructions(chatId, "Welcome to <b>Naqashly Life OS Companion Bot</b>! 🤖\n\nPlease link your Telegram account first by logging into the Web Dashboard, clicking <b>'Link Telegram Bot'</b>, and entering the code here as: <code>/start CODE</code>.");
                } else {
                    try {
                        Map<String, Object> linkResult = authClient.verifyLinkCode(chatId, code);
                        String name = String.valueOf(linkResult.get("name"));
                        sendInstructions(chatId, String.format("🎉 <b>Success, %s!</b>\n\nYour Telegram account has been linked successfully. Type /menu to explore options or start logging!", name));
                    } catch (Exception e) {
                        log.error("Failed to link Telegram code: {}", code, e);
                        sendInstructions(chatId, "❌ <b>Activation Failed</b>\n\nThat activation code is invalid or has expired. Please get a fresh code from your Naqashly profile dashboard.");
                    }
                }
                return ResponseEntity.ok().build();
            }

            // 3. Delegate to async message processor to release Tomcat thread immediately
            botChatService.processTelegramUpdateAsync(chatId, text);

        } catch (Exception e) {
            log.error("Error processing Telegram update webhook", e);
        }

        return ResponseEntity.ok().build();
    }

    private void sendInstructions(Long chatId, String text) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("chat_id", chatId);
        payload.put("text", text);
        payload.put("parse_mode", "HTML");
        try {
            telegramClient.sendMessage(botToken, payload);
        } catch (Exception e) {
            log.error("Failed to send instruction message to Telegram", e);
        }
    }

    private void sendTelegramMessage(Long chatId, BotChatResponse response) {
        String outputText = response.getText();
        Map<String, Object> replyMarkup = null;

        // Custom formatting based on message types
        if ("task_list".equals(response.getType()) && response.getData() instanceof List) {
            List<Map<String, Object>> tasks = (List<Map<String, Object>>) response.getData();
            StringBuilder sb = new StringBuilder();
            sb.append("<b>📋 Here are your active TODO tasks:</b>\n\n");
            if (tasks.isEmpty()) {
                sb.append("🎉 You have no active tasks right now!");
            } else {
                for (Map<String, Object> task : tasks) {
                    String priorityEmoji = "⚪";
                    String priority = String.valueOf(task.get("priority"));
                    if ("HIGH".equals(priority)) priorityEmoji = "🔴";
                    else if ("MEDIUM".equals(priority)) priorityEmoji = "🟡";
                    else if ("LOW".equals(priority)) priorityEmoji = "🟢";
                    sb.append(String.format("%s <b>%s</b> (%s)\n", priorityEmoji, task.get("title"), priority));
                }
            }
            outputText = sb.toString();
        } else if ("receipt".equals(response.getType()) && response.getData() instanceof Map) {
            Map<String, Object> tx = (Map<String, Object>) response.getData();
            Map<String, Object> transactionDetails = tx;
            if (tx.containsKey("transaction") && tx.get("transaction") instanceof Map) {
                transactionDetails = (Map<String, Object>) tx.get("transaction");
            }
            StringBuilder sb = new StringBuilder();
            sb.append("<b>🧾 Transaction Logged Successfully!</b>\n\n");
            sb.append(String.format("💵 <b>Amount:</b> $%s\n", transactionDetails.get("amount")));
            sb.append(String.format("🗂️ <b>Category:</b> %s\n", transactionDetails.get("category")));
            sb.append(String.format("💳 <b>Type:</b> %s\n", transactionDetails.get("transactionType")));
            outputText = sb.toString();
        }

        // Inline Keyboard layouts for options lists
        if ("options".equals(response.getType()) && response.getData() instanceof Map) {
            Map<String, Object> dataMap = (Map<String, Object>) response.getData();
            List<List<Map<String, Object>>> keyboard = new ArrayList<>();

            if (dataMap.containsKey("options")) {
                List<Map<String, String>> optionsList = (List<Map<String, String>>) dataMap.get("options");
                for (Map<String, String> opt : optionsList) {
                    keyboard.add(List.of(Map.of("text", opt.get("label"), "callback_data", opt.get("value"))));
                }
            } else if (dataMap.containsKey("chips")) {
                List<String> chipsList = (List<String>) dataMap.get("chips");
                for (String chip : chipsList) {
                    keyboard.add(List.of(Map.of("text", chip, "callback_data", chip)));
                }
            }

            if (!keyboard.isEmpty()) {
                replyMarkup = Map.of("inline_keyboard", keyboard);
            }
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("chat_id", chatId);
        payload.put("text", outputText);
        payload.put("parse_mode", "HTML");
        if (replyMarkup != null) {
            payload.put("reply_markup", replyMarkup);
        }

        try {
            telegramClient.sendMessage(botToken, payload);
        } catch (Exception e) {
            log.error("Failed to push message payload to Telegram", e);
        }
    }
}
