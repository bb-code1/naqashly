package com.naqashly.bot.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * <h1>AuthClient</h1>
 * 
 * <p><b>WHAT:</b> Feign client mapping auth-service internal endpoints for verifying Telegram links and profiles.</p>
 */
@FeignClient(name = "auth-service", url = "${app.services.auth-url:http://auth-service:8081}")
public interface AuthClient {

    @PostMapping("/api/v1/auth/telegram/verify")
    Map<String, Object> verifyLinkCode(@RequestParam("chatId") Long chatId,
                                       @RequestParam("code") String code);

    @GetMapping("/api/v1/auth/telegram/user-by-chat/{chatId}")
    Map<String, Object> getUserByChatId(@PathVariable("chatId") Long chatId);

    @PostMapping("/api/v1/auth/telegram/update-state")
    Map<String, Object> updateTelegramState(@RequestParam("chatId") Long chatId,
                                            @RequestParam("context") String context,
                                            @RequestParam("meta") String meta);
}
