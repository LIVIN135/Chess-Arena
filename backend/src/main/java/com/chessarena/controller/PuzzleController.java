package com.chessarena.controller;

import com.chessarena.dto.request.SubmitPuzzleAttemptRequest;
import com.chessarena.dto.response.ApiResponse;
import com.chessarena.dto.response.PuzzleAttemptResponse;
import com.chessarena.dto.response.PuzzleResponse;
import com.chessarena.dto.response.PuzzleStatsResponse;
import com.chessarena.entity.User;
import com.chessarena.service.PuzzleService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/puzzles")
public class PuzzleController {

    private final PuzzleService puzzleService;

    public PuzzleController(PuzzleService puzzleService) {
        this.puzzleService = puzzleService;
    }

    @GetMapping("/random")
    public ResponseEntity<ApiResponse<PuzzleResponse>> getRandomPuzzle(
            @RequestParam(value = "rating", required = false) Integer rating,
            @RequestParam(value = "theme", required = false) String theme
    ) {
        PuzzleResponse puzzle = puzzleService.getRandomPuzzle(rating, theme);
        return ResponseEntity.ok(ApiResponse.ok("Puzzle retrieved", puzzle));
    }

    @GetMapping("/daily")
    public ResponseEntity<ApiResponse<PuzzleResponse>> getDailyPuzzle() {
        PuzzleResponse puzzle = puzzleService.getDailyPuzzle();
        return ResponseEntity.ok(ApiResponse.ok("Daily puzzle retrieved", puzzle));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PuzzleResponse>> getPuzzleById(@PathVariable("id") UUID id) {
        PuzzleResponse puzzle = puzzleService.getPuzzleById(id);
        return ResponseEntity.ok(ApiResponse.ok("Puzzle retrieved", puzzle));
    }

    @PostMapping("/{id}/attempt")
    public ResponseEntity<ApiResponse<PuzzleAttemptResponse>> submitAttempt(
            @PathVariable("id") UUID id,
            @RequestBody SubmitPuzzleAttemptRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        PuzzleAttemptResponse response = puzzleService.submitAttempt(currentUser, id, request);
        return ResponseEntity.ok(ApiResponse.ok("Puzzle attempt recorded", response));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<PuzzleStatsResponse>> getUserStats(
            @AuthenticationPrincipal User currentUser
    ) {
        PuzzleStatsResponse stats = puzzleService.getUserStats(currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Puzzle statistics retrieved", stats));
    }

    @GetMapping("/themes")
    public ResponseEntity<ApiResponse<List<String>>> getThemes() {
        List<String> themes = puzzleService.getAvailableThemes();
        return ResponseEntity.ok(ApiResponse.ok("Puzzle themes retrieved", themes));
    }
}
