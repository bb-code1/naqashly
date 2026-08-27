package com.naqashly.monolith.common.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * <h1>Centralized OpenAPI / Swagger Documentation Config</h1>
 * 
 * <p><b>WHAT:</b> Configures unified Swagger 3 documentation and JWT Bearer security schemes for all platform APIs.</p>
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Naqashly Life OS — Unified Modular Monolith API")
                        .version("1.0.0")
                        .description("Unified API documentation for Auth, Routine, Productivity, Journal, Finance, and Bot domains.")
                        .license(new License().name("Proprietary").url("https://naqashly.zblslabs.online")))
                .addSecurityItem(new SecurityRequirement().addList("BearerAuth"))
                .schemaRequirement("BearerAuth", new SecurityScheme()
                        .name("BearerAuth")
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT"));
    }
}
