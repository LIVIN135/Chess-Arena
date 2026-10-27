package com.chessarena.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "moves", indexes = {
    @Index(name = "idx_moves_game_id", columnList = "game_id"),
    @Index(name = "idx_moves_game_number", columnList = "game_id, move_number")
})
public class Move {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    @Column(name = "move_number", nullable = false)
    private int moveNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "player_color", nullable = false, length = 10)
    private PlayerColor playerColor;

    @Column(nullable = false, length = 20)
    private String san;

    @Column(name = "from_square", nullable = false, length = 10)
    private String fromSquare;

    @Column(name = "to_square", nullable = false, length = 10)
    private String toSquare;

    @Column(name = "fen_after", length = 150)
    private String fenAfter;

    @Column(name = "clock_remaining_ms")
    private Long clockRemainingMs;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public Move() {
    }

    public Move(Game game, int moveNumber, PlayerColor playerColor, String san, String fromSquare, String toSquare, String fenAfter, Long clockRemainingMs) {
        this.game = game;
        this.moveNumber = moveNumber;
        this.playerColor = playerColor;
        this.san = san;
        this.fromSquare = fromSquare;
        this.toSquare = toSquare;
        this.fenAfter = fenAfter;
        this.clockRemainingMs = clockRemainingMs;
        this.createdAt = Instant.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
    }

    // Getters and Setters
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

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
