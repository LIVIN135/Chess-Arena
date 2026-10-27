package com.chessarena.dto.response;

public class AiMoveResponse {
    private String from;
    private String to;
    private String promotion;
    private String san;
    private double evaluation;
    private int depth;
    private String difficulty;

    public AiMoveResponse() {
    }

    public AiMoveResponse(String from, String to, String promotion, String san, double evaluation, int depth, String difficulty) {
        this.from = from;
        this.to = to;
        this.promotion = promotion;
        this.san = san;
        this.evaluation = evaluation;
        this.depth = depth;
        this.difficulty = difficulty;
    }

    public String getFrom() {
        return from;
    }

    public void setFrom(String from) {
        this.from = from;
    }

    public String getTo() {
        return to;
    }

    public void setTo(String to) {
        this.to = to;
    }

    public String getPromotion() {
        return promotion;
    }

    public void setPromotion(String promotion) {
        this.promotion = promotion;
    }

    public String getSan() {
        return san;
    }

    public void setSan(String san) {
        this.san = san;
    }

    public double getEvaluation() {
        return evaluation;
    }

    public void setEvaluation(double evaluation) {
        this.evaluation = evaluation;
    }

    public int getDepth() {
        return depth;
    }

    public void setDepth(int depth) {
        this.depth = depth;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }
}
