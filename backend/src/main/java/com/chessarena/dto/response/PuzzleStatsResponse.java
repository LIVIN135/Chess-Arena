package com.chessarena.dto.response;

public class PuzzleStatsResponse {
    private int puzzleRating;
    private int puzzlesSolved;
    private int puzzlesAttempted;
    private double successRate;

    public PuzzleStatsResponse() {
    }

    public PuzzleStatsResponse(int puzzleRating, int puzzlesSolved, int puzzlesAttempted) {
        this.puzzleRating = puzzleRating;
        this.puzzlesSolved = puzzlesSolved;
        this.puzzlesAttempted = puzzlesAttempted;
        this.successRate = puzzlesAttempted > 0 ?
                Math.round(((double) puzzlesSolved / puzzlesAttempted) * 1000.0) / 10.0 : 0.0;
    }

    public int getPuzzleRating() {
        return puzzleRating;
    }

    public void setPuzzleRating(int puzzleRating) {
        this.puzzleRating = puzzleRating;
    }

    public int getPuzzlesSolved() {
        return puzzlesSolved;
    }

    public void setPuzzlesSolved(int puzzlesSolved) {
        this.puzzlesSolved = puzzlesSolved;
    }

    public int getPuzzlesAttempted() {
        return puzzlesAttempted;
    }

    public void setPuzzlesAttempted(int puzzlesAttempted) {
        this.puzzlesAttempted = puzzlesAttempted;
    }

    public double getSuccessRate() {
        return successRate;
    }

    public void setSuccessRate(double successRate) {
        this.successRate = successRate;
    }
}
