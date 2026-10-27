package com.chessarena.controller;

import com.chessarena.dto.request.AiMoveRequest;
import com.chessarena.dto.response.AiMoveResponse;
import com.chessarena.dto.response.ApiResponse;
import com.chessarena.service.AiChessService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiChessService aiChessService;

    public AiController(AiChessService aiChessService) {
        this.aiChessService = aiChessService;
    }

    @PostMapping("/move")
    public ResponseEntity<ApiResponse<AiMoveResponse>> getAiMove(@RequestBody AiMoveRequest request) {
        if (request.getFen() == null || request.getFen().isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("FEN string is required"));
        }

        AiMoveResponse response = aiChessService.computeBestMove(request.getFen(), request.getDifficulty());
        return ResponseEntity.ok(ApiResponse.ok("AI move computed successfully", response));
    }

    @GetMapping("/bots")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAvailableBots() {
        List<Map<String, Object>> bots = List.of(
                Map.of(
                        "id", "NOVICE",
                        "name", "Pawn Prodigy",
                        "difficulty", "Novice",
                        "rating", 800,
                        "description", "Learning the basics. Plays fast and occasionally blunders tactical pieces.",
                        "avatar", "♟️",
                        "depth", 1
                ),
                Map.of(
                        "id", "INTERMEDIATE",
                        "name", "Knight Templar",
                        "difficulty", "Intermediate",
                        "rating", 1300,
                        "description", "Competent tactical player. Actively looks for captures and piece development.",
                        "avatar", "♞",
                        "depth", 2
                ),
                Map.of(
                        "id", "ADVANCED",
                        "name", "Bishop Strategist",
                        "difficulty", "Advanced",
                        "rating", 1700,
                        "description", "Strong positional player. Controls diagonals, center squares, and king safety.",
                        "avatar", "♝",
                        "depth", 3
                ),
                Map.of(
                        "id", "MASTER",
                        "name", "Grandmaster Engine",
                        "difficulty", "Master",
                        "rating", 2100,
                        "description", "Deep tactical calculation with minimax alpha-beta pruning. Punishes mistakes.",
                        "avatar", "👑",
                        "depth", 4
                )
        );

        return ResponseEntity.ok(ApiResponse.ok("Bots retrieved successfully", bots));
    }
}
