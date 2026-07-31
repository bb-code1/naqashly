package com.naqashly.bot.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

/**
 * <h1>TelegramClient</h1>
 * 
 * <p><b>WHAT:</b> OpenFeign Client calling Telegram Bot API endpoints to push outbound chat notifications.</p>
 */
@FeignClient(name = "telegram-client", url = "https://api.telegram.org")
public interface TelegramClient {

    @PostMapping("/bot{token}/sendMessage")
    Map<String, Object> sendMessage(@PathVariable("token") String token,
                                    @RequestBody Map<String, Object> payload);
}
