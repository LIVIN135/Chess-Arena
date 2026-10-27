package com.chessarena.service;

import com.chessarena.dto.request.CreateGameRequest;
import com.chessarena.dto.request.EndGameRequest;
import com.chessarena.dto.request.RecordMoveRequest;
import com.chessarena.dto.response.GameDetailResponse;
import com.chessarena.dto.response.GameSummaryResponse;
import com.chessarena.dto.response.MoveResponse;
import com.chessarena.entity.*;
import com.chessarena.repository.GameRepository;
import com.chessarena.repository.MoveRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class GameService {

    private final GameRepository gameRepository;
    private final MoveRepository moveRepository;

    public GameService(GameRepository gameRepository, MoveRepository moveRepository) {
        this.gameRepository = gameRepository;
        this.moveRepository = moveRepository;
    }

    @Transactional
    public GameSummaryResponse createGame(CreateGameRequest request, User currentUser) {
        String whiteName = request.getWhitePlayerName();
        String blackName = request.getBlackPlayerName();

        if (currentUser != null && (whiteName == null || whiteName.isBlank() || whiteName.equals("White Player"))) {
            whiteName = currentUser.getUsername();
        }
        if (whiteName == null || whiteName.isBlank()) {
            whiteName = "White Player";
        }
        if (blackName == null || blackName.isBlank()) {
            blackName = "Black Player";
        }

        Game game = new Game(whiteName, blackName, request.getGameType(), request.getTimeControl());
        if (currentUser != null) {
            game.setWhitePlayer(currentUser);
        }

        // Handle single-request final game save (Phase 3.4)
        if (request.getResult() != null && !request.getResult().isBlank()) {
            try {
                game.setResult(GameResult.valueOf(request.getResult().toUpperCase()));
            } catch (Exception e) {
                game.setResult(GameResult.DRAW);
            }
            game.setStatus(GameStatus.COMPLETED);
            game.setEndTime(Instant.now());
        }
        if (request.getTermination() != null) {
            game.setTerminationReason(request.getTermination());
        }
        if (request.getPgn() != null) {
            game.setPgn(request.getPgn());
        }
        if (request.getFinalFen() != null) {
            game.setFinalFen(request.getFinalFen());
        }

        Game savedGame = gameRepository.save(game);
        return toSummaryResponse(savedGame);
    }

    public void verifyGameAccess(UUID gameId, User currentUser) {
        if (currentUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Game not found"));

        boolean isWhite = game.getWhitePlayer() != null && game.getWhitePlayer().getId().equals(currentUser.getId());
        boolean isBlack = game.getBlackPlayer() != null && game.getBlackPlayer().getId().equals(currentUser.getId());
        boolean isAnonymousVsAi = game.getWhitePlayer() == null && game.getBlackPlayer() == null && "VS_AI".equalsIgnoreCase(game.getGameType());

        if (!isWhite && !isBlack && !isAnonymousVsAi) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to modify game: " + gameId);
        }
    }

    @Transactional
    public MoveResponse recordMove(UUID gameId, RecordMoveRequest request, User currentUser) {
        verifyGameAccess(gameId, currentUser);

        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new IllegalArgumentException("Game not found with ID: " + gameId));

        Move move = new Move(
                game,
                request.getMoveNumber(),
                request.getPlayerColor(),
                request.getSan(),
                request.getFromSquare(),
                request.getToSquare(),
                request.getFenAfter(),
                request.getClockRemainingMs()
        );

        if (request.getFenAfter() != null) {
            game.setFinalFen(request.getFenAfter());
        }

        Move savedMove = moveRepository.save(move);
        return toMoveResponse(savedMove);
    }

    @Transactional
    public GameSummaryResponse endGame(UUID gameId, EndGameRequest request, User currentUser) {
        verifyGameAccess(gameId, currentUser);

        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new IllegalArgumentException("Game not found with ID: " + gameId));

        game.setResult(request.getResult());
        game.setTerminationReason(request.getTerminationReason());
        if (request.getFinalFen() != null) {
            game.setFinalFen(request.getFinalFen());
        }
        if (request.getPgn() != null) {
            game.setPgn(request.getPgn());
        }
        game.setStatus(GameStatus.COMPLETED);
        game.setEndTime(Instant.now());

        Game updatedGame = gameRepository.save(game);
        return toSummaryResponse(updatedGame);
    }

    @Transactional(readOnly = true)
    public GameDetailResponse getGameById(UUID gameId) {
        Game game = gameRepository.findByIdWithMoves(gameId)
                .orElseThrow(() -> new IllegalArgumentException("Game not found with ID: " + gameId));

        List<MoveResponse> moveResponses = game.getMoves().stream()
                .map(this::toMoveResponse)
                .collect(Collectors.toList());

        return new GameDetailResponse(
                game.getId(),
                game.getWhitePlayerName(),
                game.getBlackPlayerName(),
                game.getResult(),
                game.getTerminationReason(),
                game.getGameType(),
                game.getTimeControl(),
                game.getStartTime(),
                game.getEndTime(),
                game.getFinalFen(),
                game.getPgn(),
                game.getStatus(),
                moveResponses
        );
    }

    @Transactional(readOnly = true)
    public List<GameSummaryResponse> getRecentGames(int limit) {
        return gameRepository.findByOrderByStartTimeDesc(PageRequest.of(0, Math.min(limit, 50)))
                .stream()
                .map(this::toSummaryResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<GameSummaryResponse> getUserGameHistory(User user, int page, int size) {
        PageRequest pageRequest = PageRequest.of(Math.max(0, page), Math.min(Math.max(1, size), 50));
        return gameRepository.findByWhitePlayerOrBlackPlayerOrderByStartTimeDesc(user, user, pageRequest)
                .stream()
                .map(this::toSummaryResponse)
                .collect(Collectors.toList());
    }

    private GameSummaryResponse toSummaryResponse(Game game) {
        // Elimination of N+1 query: using cached or formula movesCount
        int movesCount = game.getMovesCount();
        return new GameSummaryResponse(
                game.getId(),
                game.getWhitePlayerName(),
                game.getBlackPlayerName(),
                game.getResult(),
                game.getTerminationReason(),
                game.getGameType(),
                game.getTimeControl(),
                game.getStartTime(),
                game.getEndTime(),
                game.getFinalFen(),
                game.getStatus(),
                movesCount
        );
    }

    private MoveResponse toMoveResponse(Move move) {
        return new MoveResponse(
                move.getId(),
                move.getMoveNumber(),
                move.getPlayerColor(),
                move.getSan(),
                move.getFromSquare(),
                move.getToSquare(),
                move.getFenAfter(),
                move.getClockRemainingMs(),
                move.getCreatedAt()
        );
    }
}
