package com.naqashly.productivity.model;

import lombok.*;

/**
 * 🏛️ Standardized API Error Details Model (Productivity Service)
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiError {
    private String code;
    private String message;
}
