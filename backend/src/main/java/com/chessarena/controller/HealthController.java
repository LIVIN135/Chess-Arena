package com.chessarena.controller;

import com.chessarena.dto.response.ApiResponse;
import com.chessarena.dto.response.HealthResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @Value("${app.version:1.0.0}")
    private String appVersion;

    @Value("${app.database.host:localhost}")
    private String dbHost;

    @Value("${app.database.port:5432}")
    private String dbPort;

    @Value("${app.database.name:chess_arena}")
    private String dbName;

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<HealthResponse>> checkHealth(Authentication authentication) {
        Map<String, Object> details = null;
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equalsIgnoreCase(a.getAuthority()) || "ADMIN".equalsIgnoreCase(a.getAuthority()));

        if (isAdmin) {
            details = new HashMap<>();
            details.put("environment", "active");
            details.put("databaseConfigured", String.format("%s:%s/%s", dbHost, dbPort, dbName));
            details.put("architecture", "monolith");
        }

        HealthResponse health = new HealthResponse(
                "UP",
                "Chess Arena Service",
                appVersion,
                Instant.now(),
                details
        );

        return ResponseEntity.ok(ApiResponse.ok("System operational", health));
    }
}
