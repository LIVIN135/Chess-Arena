package com.chessarena.dto.request;

public class PgnAnalysisRequest {
    private String pgn;

    public PgnAnalysisRequest() {
    }

    public PgnAnalysisRequest(String pgn) {
        this.pgn = pgn;
    }

    public String getPgn() {
        return pgn;
    }

    public void setPgn(String pgn) {
        this.pgn = pgn;
    }
}
