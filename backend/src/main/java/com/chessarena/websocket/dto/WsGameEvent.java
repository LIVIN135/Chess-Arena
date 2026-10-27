package com.chessarena.websocket.dto;

import java.util.UUID;

public class WsGameEvent {
    private String type; // GAME_START, MOVE_MADE, GAME_END, DRAW_OFFER, DRAW_DECLINED, CLOCK_SYNC
    private UUID gameId;
    private String fen;
    private String san;
    private String lastMoveFrom;
    private String lastMoveTo;
    private String turn; // 'w' or 'b'
    private Long whiteTimeMs;
    private Long blackTimeMs;
    private String winner;
    private String reason;
    private String pgn;
    private String fromColor; // for draw offers

    public WsGameEvent() {
    }

    public static WsGameEvent gameStart(UUID gameId, String fen, Long whiteTimeMs, Long blackTimeMs) {
        WsGameEvent event = new WsGameEvent();
        event.setType("GAME_START");
        event.setGameId(gameId);
        event.setFen(fen);
        event.setTurn("w");
        event.setWhiteTimeMs(whiteTimeMs);
        event.setBlackTimeMs(blackTimeMs);
        return event;
    }

    public static WsGameEvent moveMade(UUID gameId, String fen, String san, String from, String to, String nextTurn, Long whiteTimeMs, Long blackTimeMs) {
        WsGameEvent event = new WsGameEvent();
        event.setType("MOVE_MADE");
        event.setGameId(gameId);
        event.setFen(fen);
        event.setSan(san);
        event.setLastMoveFrom(from);
        event.setLastMoveTo(to);
        event.setTurn(nextTurn);
        event.setWhiteTimeMs(whiteTimeMs);
        event.setBlackTimeMs(blackTimeMs);
        return event;
    }

    public static WsGameEvent gameEnd(UUID gameId, String winner, String reason, String finalFen, String pgn) {
        WsGameEvent event = new WsGameEvent();
        event.setType("GAME_END");
        event.setGameId(gameId);
        event.setWinner(winner);
        event.setReason(reason);
        event.setFen(finalFen);
        event.setPgn(pgn);
        return event;
    }

    public static WsGameEvent drawOffer(UUID gameId, String fromColor) {
        WsGameEvent event = new WsGameEvent();
        event.setType("DRAW_OFFER");
        event.setGameId(gameId);
        event.setFromColor(fromColor);
        return event;
    }

    public static WsGameEvent drawDeclined(UUID gameId, String fromColor) {
        WsGameEvent event = new WsGameEvent();
        event.setType("DRAW_DECLINED");
        event.setGameId(gameId);
        event.setFromColor(fromColor);
        return event;
    }

    // Getters and Setters
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public UUID getGameId() {
        return gameId;
    }

    public void setGameId(UUID gameId) {
        this.gameId = gameId;
    }

    public String getFen() {
        return fen;
    }

    public void setFen(String fen) {
        this.fen = fen;
    }

    public String getSan() {
        return san;
    }

    public void setSan(String san) {
        this.san = san;
    }

    public String getLastMoveFrom() {
        return lastMoveFrom;
    }

    public void setLastMoveFrom(String lastMoveFrom) {
        this.lastMoveFrom = lastMoveFrom;
    }

    public String getLastMoveTo() {
        return lastMoveTo;
    }

    public void setLastMoveTo(String lastMoveTo) {
        this.lastMoveTo = lastMoveTo;
    }

    public String getTurn() {
        return turn;
    }

    public void setTurn(String turn) {
        this.turn = turn;
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

    public String getWinner() {
        return winner;
    }

    public void setWinner(String winner) {
        this.winner = winner;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getPgn() {
        return pgn;
    }

    public void setPgn(String pgn) {
        this.pgn = pgn;
    }

    public String getFromColor() {
        return fromColor;
    }

    public void setFromColor(String fromColor) {
        this.fromColor = fromColor;
    }
}
