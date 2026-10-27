package com.chessarena.dto.response;

public class MoveAnalysisDto {
    private int moveNumber;
    private String color; // "w" or "b"
    private String san;
    private String from;
    private String to;
    private String fenBefore;
    private String fenAfter;
    private double evaluation;
    private double evalLoss;
    private String classification; // "BEST", "GOOD", "INACCURACY", "MISTAKE", "BLUNDER"
    private String bestMoveSan;
    private String bestMoveFrom;
    private String bestMoveTo;

    public MoveAnalysisDto() {
    }

    public MoveAnalysisDto(int moveNumber, String color, String san, String from, String to,
                           String fenBefore, String fenAfter, double evaluation, double evalLoss,
                           String classification, String bestMoveSan, String bestMoveFrom, String bestMoveTo) {
        this.moveNumber = moveNumber;
        this.color = color;
        this.san = san;
        this.from = from;
        this.to = to;
        this.fenBefore = fenBefore;
        this.fenAfter = fenAfter;
        this.evaluation = evaluation;
        this.evalLoss = evalLoss;
        this.classification = classification;
        this.bestMoveSan = bestMoveSan;
        this.bestMoveFrom = bestMoveFrom;
        this.bestMoveTo = bestMoveTo;
    }

    public int getMoveNumber() {
        return moveNumber;
    }

    public void setMoveNumber(int moveNumber) {
        this.moveNumber = moveNumber;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getSan() {
        return san;
    }

    public void setSan(String san) {
        this.san = san;
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

    public String getFenBefore() {
        return fenBefore;
    }

    public void setFenBefore(String fenBefore) {
        this.fenBefore = fenBefore;
    }

    public String getFenAfter() {
        return fenAfter;
    }

    public void setFenAfter(String fenAfter) {
        this.fenAfter = fenAfter;
    }

    public double getEvaluation() {
        return evaluation;
    }

    public void setEvaluation(double evaluation) {
        this.evaluation = evaluation;
    }

    public double getEvalLoss() {
        return evalLoss;
    }

    public void setEvalLoss(double evalLoss) {
        this.evalLoss = evalLoss;
    }

    public String getClassification() {
        return classification;
    }

    public void setClassification(String classification) {
        this.classification = classification;
    }

    public String getBestMoveSan() {
        return bestMoveSan;
    }

    public void setBestMoveSan(String bestMoveSan) {
        this.bestMoveSan = bestMoveSan;
    }

    public String getBestMoveFrom() {
        return bestMoveFrom;
    }

    public void setBestMoveFrom(String bestMoveFrom) {
        this.bestMoveFrom = bestMoveFrom;
    }

    public String getBestMoveTo() {
        return bestMoveTo;
    }

    public void setBestMoveTo(String bestMoveTo) {
        this.bestMoveTo = bestMoveTo;
    }
}
