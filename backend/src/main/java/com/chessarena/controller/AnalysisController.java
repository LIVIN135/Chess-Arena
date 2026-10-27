package com.chessarena.controller;

import com.chessarena.dto.response.ApiResponse;
import com.chessarena.dto.response.GameAnalysisResponse;
import com.chessarena.service.AnalysisService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/analysis")
public class AnalysisController {

    private final AnalysisService analysisService;

    public AnalysisController(AnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    @PostMapping("/game/{id}")
    public ResponseEntity<ApiResponse<GameAnalysisResponse>> analyzeGame(@PathVariable("id") UUID gameId) {
        GameAnalysisResponse response = analysisService.analyzeGame(gameId);
        return ResponseEntity.ok(ApiResponse.ok("Game analysis completed", response));
    }

    @GetMapping("/game/{id}")
    public ResponseEntity<ApiResponse<GameAnalysisResponse>> getAnalysis(@PathVariable("id") UUID gameId) {
        GameAnalysisResponse response = analysisService.getAnalysis(gameId);
        return ResponseEntity.ok(ApiResponse.ok("Game analysis retrieved", response));
    }
}
