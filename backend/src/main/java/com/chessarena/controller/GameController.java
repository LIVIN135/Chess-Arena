package com.chessarena.controller;

import com.chessarena.dto.request.CreateGameRequest;
import com.chessarena.dto.request.EndGameRequest;
import com.chessarena.dto.request.RecordMoveRequest;
import com.chessarena.dto.response.ApiResponse;
import com.chessarena.dto.response.GameDetailResponse;
import com.chessarena.dto.response.GameSummaryResponse;
import com.chessarena.dto.response.MoveResponse;
import com.chessarena.entity.User;
import com.chessarena.service.GameService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/games")
public class GameController {

    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GameSummaryResponse>> createGame(
            @RequestBody CreateGameRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        GameSummaryResponse response = gameService.createGame(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Game session initialized", response));
    }

    @PostMapping("/{id}/moves")
    public ResponseEntity<ApiResponse<MoveResponse>> recordMove(
            @PathVariable("id") UUID gameId,
            @Valid @RequestBody RecordMoveRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        MoveResponse response = gameService.recordMove(gameId, request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Move recorded", response));
    }

    @PostMapping("/{id}/end")
    public ResponseEntity<ApiResponse<GameSummaryResponse>> endGame(
            @PathVariable("id") UUID gameId,
            @Valid @RequestBody EndGameRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        GameSummaryResponse response = gameService.endGame(gameId, request, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Game completed and saved", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GameDetailResponse>> getGameById(@PathVariable("id") UUID gameId) {
        GameDetailResponse response = gameService.getGameById(gameId);
        return ResponseEntity.ok(ApiResponse.ok("Game retrieved", response));
    }

    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<GameSummaryResponse>>> getRecentGames(
            @RequestParam(defaultValue = "15") int limit
    ) {
        List<GameSummaryResponse> response = gameService.getRecentGames(limit);
        return ResponseEntity.ok(ApiResponse.ok("Recent games retrieved", response));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<GameSummaryResponse>>> getGameHistory(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<GameSummaryResponse> response = gameService.getUserGameHistory(currentUser, page, size);
        return ResponseEntity.ok(ApiResponse.ok("Game history retrieved", response));
    }
}
