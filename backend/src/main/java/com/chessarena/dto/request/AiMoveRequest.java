package com.chessarena.dto.request;

public class AiMoveRequest {
    private String fen;
    private String difficulty; // "NOVICE", "INTERMEDIATE", "ADVANCED", "MASTER"

    public AiMoveRequest() {
    }

    public AiMoveRequest(String fen, String difficulty) {
        this.fen = fen;
        this.difficulty = difficulty;
    }

    public String getFen() {
        return fen;
    }

    public void setFen(String fen) {
        this.fen = fen;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }
}
