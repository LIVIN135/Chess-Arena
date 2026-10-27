package com.chessarena.service;

import com.chessarena.dto.response.AiMoveResponse;
import com.chessarena.dto.response.GameAnalysisResponse;
import com.chessarena.dto.response.MoveAnalysisDto;
import com.chessarena.entity.Game;
import com.chessarena.entity.GameAnalysis;
import com.chessarena.entity.Move;
import com.chessarena.entity.PlayerColor;
import com.chessarena.repository.GameAnalysisRepository;
import com.chessarena.repository.GameRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
public class AnalysisService {

    private final GameRepository gameRepository;
    private final GameAnalysisRepository gameAnalysisRepository;
    private final AiChessService aiChessService;
    private final ObjectMapper objectMapper;

    public AnalysisService(GameRepository gameRepository,
                           GameAnalysisRepository gameAnalysisRepository,
                           AiChessService aiChessService,
                           ObjectMapper objectMapper) {
        this.gameRepository = gameRepository;
        this.gameAnalysisRepository = gameAnalysisRepository;
        this.aiChessService = aiChessService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public GameAnalysisResponse analyzeGame(UUID gameId) {
        // Return existing analysis if already computed
        Optional<GameAnalysis> existing = gameAnalysisRepository.findByGameId(gameId);
        if (existing.isPresent()) {
            return mapToResponse(existing.get());
        }

        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new IllegalArgumentException("Game not found with ID: " + gameId));

        List<Move> recordedMoves = game.getMoves();
        List<MoveAnalysisDto> analyzedMoves = new ArrayList<>();

        List<Double> whiteCPLosses = new ArrayList<>();
        List<Double> blackCPLosses = new ArrayList<>();

        int whiteBlunders = 0, blackBlunders = 0;
        int whiteMistakes = 0, blackMistakes = 0;
        int whiteInaccuracies = 0, blackInaccuracies = 0;
        int whiteBestMoves = 0, blackBestMoves = 0;

        String currentFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

        for (int i = 0; i < recordedMoves.size(); i++) {
            Move move = recordedMoves.get(i);
            String fenBefore = currentFen;
            String fenAfter = move.getFenAfter();
            if (fenAfter == null || fenAfter.isBlank()) {
                fenAfter = fenBefore; // fallback
            }

            boolean isWhite = move.getPlayerColor() == PlayerColor.WHITE;
            String colorStr = isWhite ? "w" : "b";

            // 1. Ask engine for best move in fenBefore
            AiMoveResponse engineChoice = aiChessService.computeBestMove(fenBefore, "MASTER");

            // 2. Evaluate position before and after
            double evalBefore = engineChoice.getEvaluation();
            AiMoveResponse playedMoveEval = aiChessService.computeBestMove(fenAfter, "MASTER");
            // Played move evaluation is negative of the opponent's best evaluation
            double evalAfter = -playedMoveEval.getEvaluation();

            // Centipawn loss (from active player's perspective)
            // positive difference means played move was worse than engine choice
            double cpDiff = Math.max(0.0, evalBefore - evalAfter);
            double cpLossCentipawns = cpDiff * 100.0;

            if (isWhite) {
                whiteCPLosses.add(cpLossCentipawns);
            } else {
                blackCPLosses.add(cpLossCentipawns);
            }

            // 3. Classify move
            String classification;
            boolean isSameMove = move.getSan() != null && engineChoice.getSan() != null &&
                    move.getSan().equals(engineChoice.getSan());

            if (isSameMove || cpDiff <= 0.15) {
                classification = "BEST";
                if (isWhite) whiteBestMoves++; else blackBestMoves++;
            } else if (cpDiff <= 0.45) {
                classification = "GOOD";
            } else if (cpDiff <= 1.0) {
                classification = "INACCURACY";
                if (isWhite) whiteInaccuracies++; else blackInaccuracies++;
            } else if (cpDiff <= 2.0) {
                classification = "MISTAKE";
                if (isWhite) whiteMistakes++; else blackMistakes++;
            } else {
                classification = "BLUNDER";
                if (isWhite) whiteBlunders++; else blackBlunders++;
            }

            MoveAnalysisDto dto = new MoveAnalysisDto(
                    move.getMoveNumber(),
                    colorStr,
                    move.getSan(),
                    move.getFromSquare(),
                    move.getToSquare(),
                    fenBefore,
                    fenAfter,
                    evalAfter,
                    cpDiff,
                    classification,
                    engineChoice.getSan(),
                    engineChoice.getFrom(),
                    engineChoice.getTo()
            );

            analyzedMoves.add(dto);
            currentFen = fenAfter;
        }

        // Calculate accuracies using CAPS formula: 100 * max(0, 1 - (avgLoss / 500))
        double whiteAccuracy = calculateAccuracy(whiteCPLosses);
        double blackAccuracy = calculateAccuracy(blackCPLosses);

        String analysisJson = "[]";
        try {
            analysisJson = objectMapper.writeValueAsString(analyzedMoves);
        } catch (Exception e) {
            // Keep default
        }

        GameAnalysis analysis = new GameAnalysis(
                game,
                whiteAccuracy,
                blackAccuracy,
                whiteBlunders,
                blackBlunders,
                whiteMistakes,
                blackMistakes,
                whiteInaccuracies,
                blackInaccuracies,
                whiteBestMoves,
                blackBestMoves,
                analysisJson
        );

        GameAnalysis saved = gameAnalysisRepository.save(analysis);

        GameAnalysisResponse response = new GameAnalysisResponse();
        response.setGameId(game.getId());
        response.setWhitePlayerName(game.getWhitePlayerName());
        response.setBlackPlayerName(game.getBlackPlayerName());
        response.setWhiteAccuracy(whiteAccuracy);
        response.setBlackAccuracy(blackAccuracy);
        response.setWhiteBlunders(whiteBlunders);
        response.setBlackBlunders(blackBlunders);
        response.setWhiteMistakes(whiteMistakes);
        response.setBlackMistakes(blackMistakes);
        response.setWhiteInaccuracies(whiteInaccuracies);
        response.setBlackInaccuracies(blackInaccuracies);
        response.setWhiteBestMoves(whiteBestMoves);
        response.setBlackBestMoves(blackBestMoves);
        response.setMoves(analyzedMoves);
        response.setAnalyzedAt(saved.getCreatedAt());

        return response;
    }

    public GameAnalysisResponse getAnalysis(UUID gameId) {
        return gameAnalysisRepository.findByGameId(gameId)
                .map(this::mapToResponse)
                .orElseGet(() -> analyzeGame(gameId));
    }

    private double calculateAccuracy(List<Double> cpLosses) {
        if (cpLosses.isEmpty()) return 100.0;
        double totalAccuracy = 0.0;
        for (Double loss : cpLosses) {
            double cappedLoss = Math.min(600.0, Math.max(0.0, loss));
            double moveAcc = 100.0 * Math.exp(-0.005 * cappedLoss);
            totalAccuracy += moveAcc;
        }
        double avg = totalAccuracy / cpLosses.size();
        return Math.round(avg * 10.0) / 10.0;
    }

    private GameAnalysisResponse mapToResponse(GameAnalysis entity) {
        GameAnalysisResponse res = new GameAnalysisResponse();
        res.setGameId(entity.getGame() != null ? entity.getGame().getId() : null);
        res.setWhitePlayerName(entity.getGame() != null ? entity.getGame().getWhitePlayerName() : "White Player");
        res.setBlackPlayerName(entity.getGame() != null ? entity.getGame().getBlackPlayerName() : "Black Player");
        res.setWhiteAccuracy(entity.getWhiteAccuracy());
        res.setBlackAccuracy(entity.getBlackAccuracy());
        res.setWhiteBlunders(entity.getWhiteBlunders());
        res.setBlackBlunders(entity.getBlackBlunders());
        res.setWhiteMistakes(entity.getWhiteMistakes());
        res.setBlackMistakes(entity.getBlackMistakes());
        res.setWhiteInaccuracies(entity.getWhiteInaccuracies());
        res.setBlackInaccuracies(entity.getBlackInaccuracies());
        res.setWhiteBestMoves(entity.getWhiteBestMoves());
        res.setBlackBestMoves(entity.getBlackBestMoves());
        res.setAnalyzedAt(entity.getCreatedAt());

        try {
            List<MoveAnalysisDto> moves = objectMapper.readValue(
                    entity.getAnalysisJson(),
                    new TypeReference<List<MoveAnalysisDto>>() {}
            );
            res.setMoves(moves);
        } catch (Exception e) {
            res.setMoves(Collections.emptyList());
        }

        return res;
    }
}
