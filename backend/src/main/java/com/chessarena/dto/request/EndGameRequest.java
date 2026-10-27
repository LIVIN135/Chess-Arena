package com.chessarena.dto.request;

import com.chessarena.entity.GameResult;
import jakarta.validation.constraints.NotNull;

public class EndGameRequest {

    @NotNull(message = "Game result is required")
    private GameResult result;

    private String terminationReason;
    private String finalFen;
    private String pgn;

    public EndGameRequest() {
    }

    public EndGameRequest(GameResult result, String terminationReason, String finalFen, String pgn) {
        this.result = result;
        this.terminationReason = terminationReason;
        this.finalFen = finalFen;
        this.pgn = pgn;
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

    public String getFinalFen() {
        return finalFen;
    }

    public void setFinalFen(String finalFen) {
        this.finalFen = finalFen;
    }

    public String getPgn() {
        return pgn;
    }

    public void setPgn(String pgn) {
        this.pgn = pgn;
    }
}
