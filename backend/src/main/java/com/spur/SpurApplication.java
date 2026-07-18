package com.spur;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.socket.config.annotation.EnableWebSocket;

/**
 * Main Spur Backend Application
 */
@SpringBootApplication
@EnableScheduling
@EnableWebSocket
@OpenAPIDefinition(
    info = @Info(
        title = "Spur API",
        version = "1.0.0",
        description = "Frictionless social scheduling API"
    )
)
@SecurityScheme(
    name = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT",
    description = "JWT authentication token",
    in = SecuritySchemeIn.HEADER
)
public class SpurApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpurApplication.class, args);
    }
}
