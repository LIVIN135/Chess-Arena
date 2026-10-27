package com.chessarena.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "game_analyses", indexes = {
    @Index(name = "idx_game_analyses_game_id", columnList = "game_id")
})
public class GameAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", unique = true)
    private Game game;

    @Column(name = "white_accuracy", nullable = false)
    private double whiteAccuracy;

    @Column(name = "black_accuracy", nullable = false)
    private double blackAccuracy;

    @Column(name = "white_blunders", nullable = false)
    private int whiteBlunders;

    @Column(name = "black_blunders", nullable = false)
    private int blackBlunders;

    @Column(name = "white_mistakes", nullable = false)
    private int whiteMistakes;

    @Column(name = "black_mistakes", nullable = false)
    private int blackMistakes;

    @Column(name = "white_inaccuracies", nullable = false)
    private int whiteInaccuracies;

    @Column(name = "black_inaccuracies", nullable = false)
    private int blackInaccuracies;

    @Column(name = "white_best_moves", nullable = false)
    private int whiteBestMoves;

    @Column(name = "black_best_moves", nullable = false)
    private int blackBestMoves;

    @Column(name = "analysis_json", columnDefinition = "TEXT", nullable = false)
    private String analysisJson;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public GameAnalysis() {
    }

    public GameAnalysis(Game game, double whiteAccuracy, double blackAccuracy,
                        int whiteBlunders, int blackBlunders,
                        int whiteMistakes, int blackMistakes,
                        int whiteInaccuracies, int blackInaccuracies,
                        int whiteBestMoves, int blackBestMoves,
                        String analysisJson) {
        this.game = game;
        this.whiteAccuracy = whiteAccuracy;
        this.blackAccuracy = blackAccuracy;
        this.whiteBlunders = whiteBlunders;
        this.blackBlunders = blackBlunders;
        this.whiteMistakes = whiteMistakes;
        this.blackMistakes = blackMistakes;
        this.whiteInaccuracies = whiteInaccuracies;
        this.blackInaccuracies = blackInaccuracies;
        this.whiteBestMoves = whiteBestMoves;
        this.blackBestMoves = blackBestMoves;
        this.analysisJson = analysisJson;
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

    public Game getGame() {
        return game;
    }

    public void setGame(Game game) {
        this.game = game;
    }

    public double getWhiteAccuracy() {
        return whiteAccuracy;
    }

    public void setWhiteAccuracy(double whiteAccuracy) {
        this.whiteAccuracy = whiteAccuracy;
    }

    public double getBlackAccuracy() {
        return blackAccuracy;
    }

    public void setBlackAccuracy(double blackAccuracy) {
        this.blackAccuracy = blackAccuracy;
    }

    public int getWhiteBlunders() {
        return whiteBlunders;
    }

    public void setWhiteBlunders(int whiteBlunders) {
        this.whiteBlunders = whiteBlunders;
    }

    public int getBlackBlunders() {
        return blackBlunders;
    }

    public void setBlackBlunders(int blackBlunders) {
        this.blackBlunders = blackBlunders;
    }

    public int getWhiteMistakes() {
        return whiteMistakes;
    }

    public void setWhiteMistakes(int whiteMistakes) {
        this.whiteMistakes = whiteMistakes;
    }

    public int getBlackMistakes() {
        return blackMistakes;
    }

    public void setBlackMistakes(int blackMistakes) {
        this.blackMistakes = blackMistakes;
    }

    public int getWhiteInaccuracies() {
        return whiteInaccuracies;
    }

    public void setWhiteInaccuracies(int whiteInaccuracies) {
        this.whiteInaccuracies = whiteInaccuracies;
    }

    public int getBlackInaccuracies() {
        return blackInaccuracies;
    }

    public void setBlackInaccuracies(int blackInaccuracies) {
        this.blackInaccuracies = blackInaccuracies;
    }

    public int getWhiteBestMoves() {
        return whiteBestMoves;
    }

    public void setWhiteBestMoves(int whiteBestMoves) {
        this.whiteBestMoves = whiteBestMoves;
    }

    public int getBlackBestMoves() {
        return blackBestMoves;
    }

    public void setBlackBestMoves(int blackBestMoves) {
        this.blackBestMoves = blackBestMoves;
    }

    public String getAnalysisJson() {
        return analysisJson;
    }

    public void setAnalysisJson(String analysisJson) {
        this.analysisJson = analysisJson;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
