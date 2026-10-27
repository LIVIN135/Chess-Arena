package com.chessarena.websocket.dto;

import java.util.UUID;

public class MatchFoundEvent {
    private UUID gameId;
    private String assignedColor; // 'white' or 'black'
    private String opponentName;
    private String timeControl;
    private String fen;
    private String pgn;
    private Long whiteTimeMs;
    private Long blackTimeMs;
    private String turn;

    public MatchFoundEvent() {
    }

    public MatchFoundEvent(UUID gameId, String assignedColor, String opponentName, String timeControl, String fen) {
        this.gameId = gameId;
        this.assignedColor = assignedColor;
        this.opponentName = opponentName;
        this.timeControl = timeControl;
        this.fen = fen;
    }

    public MatchFoundEvent(UUID gameId, String assignedColor, String opponentName, String timeControl, String fen, String pgn, Long whiteTimeMs, Long blackTimeMs, String turn) {
        this.gameId = gameId;
        this.assignedColor = assignedColor;
        this.opponentName = opponentName;
        this.timeControl = timeControl;
        this.fen = fen;
        this.pgn = pgn;
        this.whiteTimeMs = whiteTimeMs;
        this.blackTimeMs = blackTimeMs;
        this.turn = turn;
    }

    public UUID getGameId() {
        return gameId;
    }

    public void setGameId(UUID gameId) {
        this.gameId = gameId;
    }

    public String getAssignedColor() {
        return assignedColor;
    }

    public void setAssignedColor(String assignedColor) {
        this.assignedColor = assignedColor;
    }

    public String getOpponentName() {
        return opponentName;
    }

    public void setOpponentName(String opponentName) {
        this.opponentName = opponentName;
    }

    public String getTimeControl() {
        return timeControl;
    }

    public void setTimeControl(String timeControl) {
        this.timeControl = timeControl;
    }

    public String getFen() {
        return fen;
    }

    public void setFen(String fen) {
        this.fen = fen;
    }

    public String getPgn() {
        return pgn;
    }

    public void setPgn(String pgn) {
        this.pgn = pgn;
    }

    public Long getWhiteTimeMs() {
        return whiteTimeMs;
    }

    public void setWhiteTimeMs(Long whiteTimeMs) {
        this.whiteTimeMs = whiteTimeMs;
    }

    public Long getBlackTimeMs() {
        return blackTimeMs;
    }

    public void setBlackTimeMs(Long blackTimeMs) {
        this.blackTimeMs = blackTimeMs;
    }

    public String getTurn() {
        return turn;
    }

    public void setTurn(String turn) {
        this.turn = turn;
    }
}
