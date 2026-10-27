package com.chessarena.dto.response;

import com.chessarena.entity.PlayerColor;
import java.time.Instant;
import java.util.UUID;

public class MoveResponse {
    private UUID id;
    private int moveNumber;
    private PlayerColor playerColor;
    private String san;
    private String fromSquare;
    private String toSquare;
    private String fenAfter;
    private Long clockRemainingMs;
    private Instant createdAt;

    public MoveResponse() {
    }

    public MoveResponse(UUID id, int moveNumber, PlayerColor playerColor, String san, String fromSquare, String toSquare, String fenAfter, Long clockRemainingMs, Instant createdAt) {
        this.id = id;
        this.moveNumber = moveNumber;
        this.playerColor = playerColor;
        this.san = san;
        this.fromSquare = fromSquare;
        this.toSquare = toSquare;
        this.fenAfter = fenAfter;
        this.clockRemainingMs = clockRemainingMs;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public int getMoveNumber() {
        return moveNumber;
    }

    public void setMoveNumber(int moveNumber) {
        this.moveNumber = moveNumber;
    }

    public PlayerColor getPlayerColor() {
        return playerColor;
    }

    public void setPlayerColor(PlayerColor playerColor) {
        this.playerColor = playerColor;
    }

    public String getSan() {
        return san;
    }

    public void setSan(String san) {
        this.san = san;
    }

    public String getFromSquare() {
        return fromSquare;
    }

    public void setFromSquare(String fromSquare) {
        this.fromSquare = fromSquare;
    }

    public String getToSquare() {
        return toSquare;
    }

    public void setToSquare(String toSquare) {
        this.toSquare = toSquare;
    }

    public String getFenAfter() {
        return fenAfter;
    }

    public void setFenAfter(String fenAfter) {
        this.fenAfter = fenAfter;
    }

    public Long getClockRemainingMs() {
        return clockRemainingMs;
    }

    public void setClockRemainingMs(Long clockRemainingMs) {
        this.clockRemainingMs = clockRemainingMs;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
