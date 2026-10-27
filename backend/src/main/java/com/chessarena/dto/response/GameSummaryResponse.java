package com.chessarena.dto.response;

import com.chessarena.entity.GameResult;
import com.chessarena.entity.GameStatus;
import java.time.Instant;
import java.util.UUID;

public class GameSummaryResponse {
    private UUID id;
    private String whitePlayerName;
    private String blackPlayerName;
    private GameResult result;
    private String terminationReason;
    private String gameType;
    private String timeControl;
    private Instant startTime;
    private Instant endTime;
    private String finalFen;
    private GameStatus status;
    private int movesCount;

    public GameSummaryResponse() {
    }

    public GameSummaryResponse(UUID id, String whitePlayerName, String blackPlayerName, GameResult result, String terminationReason, String gameType, String timeControl, Instant startTime, Instant endTime, String finalFen, GameStatus status, int movesCount) {
        this.id = id;
        this.whitePlayerName = whitePlayerName;
        this.blackPlayerName = blackPlayerName;
        this.result = result;
        this.terminationReason = terminationReason;
        this.gameType = gameType;
        this.timeControl = timeControl;
        this.startTime = startTime;
        this.endTime = endTime;
        this.finalFen = finalFen;
        this.status = status;
        this.movesCount = movesCount;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
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

    public GameResult getResult() {
        return result;
    }

    public void setResult(GameResult result) {
        this.result = result;
    }

    public String getTerminationReason() {
        return terminationReason;
    }

    public void setTerminationReason(String terminationReason) {
        this.terminationReason = terminationReason;
    }

    public String getGameType() {
        return gameType;
    }

    public void setGameType(String gameType) {
        this.gameType = gameType;
    }

    public String getTimeControl() {
        return timeControl;
    }

    public void setTimeControl(String timeControl) {
        this.timeControl = timeControl;
    }

    public Instant getStartTime() {
        return startTime;
    }

    public void setStartTime(Instant startTime) {
        this.startTime = startTime;
    }

    public Instant getEndTime() {
        return endTime;
    }

    public void setEndTime(Instant endTime) {
        this.endTime = endTime;
    }

    public String getFinalFen() {
        return finalFen;
    }

    public void setFinalFen(String finalFen) {
        this.finalFen = finalFen;
    }

    public GameStatus getStatus() {
        return status;
    }

    public void setStatus(GameStatus status) {
        this.status = status;
    }

    public int getMovesCount() {
        return movesCount;
    }

    public void setMovesCount(int movesCount) {
        this.movesCount = movesCount;
    }
}
