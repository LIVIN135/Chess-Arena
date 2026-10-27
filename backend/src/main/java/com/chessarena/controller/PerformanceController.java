package com.chessarena.controller;

import com.chessarena.dto.response.ApiResponse;
import com.chessarena.dto.response.PerformanceMetricsResponse;
import com.chessarena.service.PerformanceMetricsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/monitoring")
public class PerformanceController {

    private final PerformanceMetricsService metricsService;

    public PerformanceController(PerformanceMetricsService metricsService) {
        this.metricsService = metricsService;
    }

    @GetMapping("/metrics")
    public ResponseEntity<PerformanceMetricsResponse> getMetrics() {
        return ResponseEntity.ok(metricsService.collectPerformanceMetrics());
    }


    @PostMapping("/cache/clear")
    public ResponseEntity<ApiResponse<String>> clearCaches() {
        metricsService.clearAllCaches();
        return ResponseEntity.ok(ApiResponse.ok("All performance caches cleared successfully", "OK"));
    }
}
