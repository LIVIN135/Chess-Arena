package com.chessarena.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "puzzles", indexes = {
    @Index(name = "idx_puzzles_rating", columnList = "rating"),
    @Index(name = "idx_puzzles_themes", columnList = "themes")
})
public class Puzzle {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "puzzle_code", length = 50)
    private String puzzleCode;

    @Column(nullable = false, length = 150)
    private String fen;

    @Column(nullable = false, length = 250)
    private String moves; // Space-separated UCI moves: e.g. "d4d5 e7e5 d5e6"

    @Column(nullable = false)
    private int rating = 1200;

    @Column(name = "rating_deviation")
    private int ratingDeviation = 75;

    private int popularity = 95;

    @Column(name = "nb_plays")
    private int nbPlays = 100;

    @Column(length = 200)
    private String themes; // e.g. "mateIn1", "fork", "pin", "hangingPiece", "endgame"

    @Column(name = "opening_tags", length = 100)
    private String openingTags;

    @Column(length = 250)
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public Puzzle() {
    }

    public Puzzle(String puzzleCode, String fen, String moves, int rating, String themes, String description) {
        this.puzzleCode = puzzleCode;
        this.fen = fen;
        this.moves = moves;
        this.rating = rating;
        this.themes = themes;
        this.description = description;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
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

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public int getRatingDeviation() {
        return ratingDeviation;
    }

    public void setRatingDeviation(int ratingDeviation) {
        this.ratingDeviation = ratingDeviation;
    }

    public int getPopularity() {
        return popularity;
    }

    public void setPopularity(int popularity) {
        this.popularity = popularity;
    }

    public int getNbPlays() {
        return nbPlays;
    }

    public void setNbPlays(int nbPlays) {
        this.nbPlays = nbPlays;
    }

    public String getThemes() {
        return themes;
    }

    public void setThemes(String themes) {
        this.themes = themes;
    }

    public String getOpeningTags() {
        return openingTags;
    }

    public void setOpeningTags(String openingTags) {
        this.openingTags = openingTags;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
