package com.chessarena.dto.response;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class GameAnalysisResponse {
    private UUID gameId;
    private String whitePlayerName;
    private String blackPlayerName;
    private double whiteAccuracy;
    private double blackAccuracy;
    private int whiteBlunders;
    private int blackBlunders;
    private int whiteMistakes;
    private int blackMistakes;
    private int whiteInaccuracies;
    private int blackInaccuracies;
    private int whiteBestMoves;
    private int blackBestMoves;
    private List<MoveAnalysisDto> moves;
    private Instant analyzedAt;

    public GameAnalysisResponse() {
    }

    public UUID getGameId() {
        return gameId;
    }

    public void setGameId(UUID gameId) {
        this.gameId = gameId;
    }

    public String getWhitePlayerName() {
        return whitePlayerName;
    }

    public void setWhitePlayerName(String whitePlayerName) {
        this.whitePlayerName = whitePlayerName;
    }

    public String getBlackPlayerName() {
        return blackPlayerName;
    }

    public void setBlackPlayerName(String blackPlayerName) {
        this.blackPlayerName = blackPlayerName;
    }

    public double getWhiteAccuracy() {
        return whiteAccuracy;
    }

    public void setWhiteAccuracy(double whiteAccuracy) {
        this.whiteAccuracy = whiteAccuracy;
    }

    public double getBlackAccuracy() {
        return blackAccuracy;
    }

    public void setBlackAccuracy(double blackAccuracy) {
        this.blackAccuracy = blackAccuracy;
    }

    public int getWhiteBlunders() {
        return whiteBlunders;
    }

    public void setWhiteBlunders(int whiteBlunders) {
        this.whiteBlunders = whiteBlunders;
    }

    public int getBlackBlunders() {
        return blackBlunders;
    }

    public void setBlackBlunders(int blackBlunders) {
        this.blackBlunders = blackBlunders;
    }

    public int getWhiteMistakes() {
        return whiteMistakes;
    }

    public void setWhiteMistakes(int whiteMistakes) {
        this.whiteMistakes = whiteMistakes;
    }

    public int getBlackMistakes() {
        return blackMistakes;
    }

    public void setBlackMistakes(int blackMistakes) {
        this.blackMistakes = blackMistakes;
    }

    public int getWhiteInaccuracies() {
        return whiteInaccuracies;
    }

    public void setWhiteInaccuracies(int whiteInaccuracies) {
        this.whiteInaccuracies = whiteInaccuracies;
    }

    public int getBlackInaccuracies() {
        return blackInaccuracies;
    }

    public void setBlackInaccuracies(int blackInaccuracies) {
        this.blackInaccuracies = blackInaccuracies;
    }

    public int getWhiteBestMoves() {
        return whiteBestMoves;
    }

    public void setWhiteBestMoves(int whiteBestMoves) {
        this.whiteBestMoves = whiteBestMoves;
    }

    public int getBlackBestMoves() {
        return blackBestMoves;
    }

    public void setBlackBestMoves(int blackBestMoves) {
        this.blackBestMoves = blackBestMoves;
    }

    public List<MoveAnalysisDto> getMoves() {
        return moves;
    }

    public void setMoves(List<MoveAnalysisDto> moves) {
        this.moves = moves;
    }

    public Instant getAnalyzedAt() {
        return analyzedAt;
    }

    public void setAnalyzedAt(Instant analyzedAt) {
        this.analyzedAt = analyzedAt;
    }
}
