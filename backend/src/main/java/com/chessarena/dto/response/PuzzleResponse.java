package com.chessarena.dto.response;

import java.util.List;
import java.util.UUID;

public class PuzzleResponse {
    private UUID id;
    private String puzzleCode;
    private String fen;
    private String moves;
    private String initialMove;
    private List<String> solutionMoves;
    private int rating;
    private List<String> themes;
    private String description;
    private String playerColor; // "white" or "black"

    public PuzzleResponse() {
    }

    public PuzzleResponse(UUID id, String puzzleCode, String fen, String moves,
                          String initialMove, List<String> solutionMoves,
                          int rating, List<String> themes, String description, String playerColor) {
        this.id = id;
        this.puzzleCode = puzzleCode;
        this.fen = fen;
        this.moves = moves;
        this.initialMove = initialMove;
        this.solutionMoves = solutionMoves;
        this.rating = rating;
        this.themes = themes;
        this.description = description;
        this.playerColor = playerColor;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getPuzzleCode() {
        return puzzleCode;
    }

    public void setPuzzleCode(String puzzleCode) {
        this.puzzleCode = puzzleCode;
    }

    public String getFen() {
        return fen;
    }

    public void setFen(String fen) {
        this.fen = fen;
    }

    public String getMoves() {
        return moves;
    }

    public void setMoves(String moves) {
        this.moves = moves;
    }

    public String getInitialMove() {
        return initialMove;
    }

    public void setInitialMove(String initialMove) {
        this.initialMove = initialMove;
    }

    public List<String> getSolutionMoves() {
        return solutionMoves;
    }

    public void setSolutionMoves(List<String> solutionMoves) {
        this.solutionMoves = solutionMoves;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public List<String> getThemes() {
        return themes;
    }

    public void setThemes(List<String> themes) {
        this.themes = themes;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPlayerColor() {
        return playerColor;
    }

    public void setPlayerColor(String playerColor) {
        this.playerColor = playerColor;
    }
}
