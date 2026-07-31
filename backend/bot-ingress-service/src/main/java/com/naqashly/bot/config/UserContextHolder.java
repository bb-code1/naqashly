package com.naqashly.bot.config;

/**
 * <h1>UserContextHolder</h1>
 * 
 * <p><b>WHAT:</b> Thread-local storage container to propagate the authenticated User ID context across threads.</p>
 * <p><b>WHY:</b> Allows asynchronous processes like Telegram webhook callbacks to set the target caller context before executing Feign client calls downstream.</p>
 */
public class UserContextHolder {

    private static final ThreadLocal<String> userIdThreadLocal = new ThreadLocal<>();

    public static void setUserId(String userId) {
        userIdThreadLocal.set(userId);
    }

    public static String getUserId() {
        return userIdThreadLocal.get();
    }

    public static void clear() {
        userIdThreadLocal.remove();
    }
}
