package com.naqashly.productivity.model;

import lombok.*;
import java.time.ZonedDateTime;

/**
 * 🏛️ Standardized API Response Envelope (Productivity Service)
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiResponse<T> {

    private boolean success;
    private String timestamp;
    private T data;
    private ApiError error;

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .timestamp(ZonedDateTime.now().toString())
                .data(data)
                .error(null)
                .build();
    }

    public static <T> ApiResponse<T> error(String code, String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .timestamp(ZonedDateTime.now().toString())
                .data(null)
                .error(new ApiError(code, message))
                .build();
    }
}
