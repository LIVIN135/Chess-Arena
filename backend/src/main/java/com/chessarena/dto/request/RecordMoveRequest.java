package com.chessarena.dto.request;

import com.chessarena.entity.PlayerColor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class RecordMoveRequest {

    private int moveNumber;

    @NotNull(message = "Player color is required")
    private PlayerColor playerColor;

    @NotBlank(message = "SAN notation is required")
    private String san;

    @NotBlank(message = "From square is required")
    private String fromSquare;

    @NotBlank(message = "To square is required")
    private String toSquare;

    private String fenAfter;
    private Long clockRemainingMs;

    public RecordMoveRequest() {
    }

    public RecordMoveRequest(int moveNumber, PlayerColor playerColor, String san, String fromSquare, String toSquare, String fenAfter, Long clockRemainingMs) {
        this.moveNumber = moveNumber;
        this.playerColor = playerColor;
        this.san = san;
        this.fromSquare = fromSquare;
        this.toSquare = toSquare;
        this.fenAfter = fenAfter;
        this.clockRemainingMs = clockRemainingMs;
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
}
