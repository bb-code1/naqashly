package com.naqashly.finance.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

/**
 * <h1>OpenAPI Documentation & Security Scheme Configuration</h1>
 */
@Configuration
@OpenAPIDefinition(
    info = @Info(title = "Naqashly Finance Service API", version = "v1.0.0", description = "Finance Ledger & Double-Entry Accounting Service API Documentation"),
    security = @SecurityRequirement(name = "X-User-Id")
)
@SecurityScheme(
    name = "X-User-Id",
    type = SecuritySchemeType.APIKEY,
    in = SecuritySchemeIn.HEADER,
    paramName = "X-User-Id",
    description = "Gateway-forwarded authenticated User ID header"
)
public class OpenApiConfig {
}
