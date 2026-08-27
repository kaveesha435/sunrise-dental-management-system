package com.sunrisedental.controller;

import com.sunrisedental.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Health check endpoint.
 * GET /api/health — returns service status.
 */
@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, String>>> health() {
        Map<String, String> payload = Map.of(
                "status", "UP",
                "service", "Sunrise Dental API",
                "version", "1.0.0"
        );
        return ResponseEntity.ok(ApiResponse.success("Service is healthy", payload));
    }
}
