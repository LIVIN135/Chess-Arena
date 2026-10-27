package com.chessarena.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "games", indexes = {
    @Index(name = "idx_games_status", columnList = "status"),
    @Index(name = "idx_games_start_time", columnList = "start_time")
})
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "white_player_id")
    private User whitePlayer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "black_player_id")
    private User blackPlayer;

    @Column(name = "white_player_name", nullable = false, length = 100)
    private String whitePlayerName = "White Player";

    @Column(name = "black_player_name", nullable = false, length = 100)
    private String blackPlayerName = "Black Player";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private GameResult result = GameResult.IN_PROGRESS;

    @Column(name = "termination_reason", length = 100)
    private String terminationReason;

    @Column(name = "game_type", nullable = false, length = 50)
    private String gameType = "RAPID";

    @Column(name = "time_control", nullable = false, length = 50)
    private String timeControl = "10m";

    @Column(name = "start_time", nullable = false)
    private Instant startTime;

    @Column(name = "end_time")
    private Instant endTime;

    @Column(name = "final_fen", length = 150)
    private String finalFen;

    @Column(columnDefinition = "TEXT")
    private String pgn;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private GameStatus status = GameStatus.IN_PROGRESS;

    @OneToMany(mappedBy = "game", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("moveNumber ASC")
    private List<Move> moves = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @org.hibernate.annotations.Formula("(select count(*) from moves m where m.game_id = id)")
    private Integer movesCount;

    public int getMovesCount() {
        return movesCount != null ? movesCount : (moves != null ? moves.size() : 0);
    }

    public Game() {
    }

    public Game(String whitePlayerName, String blackPlayerName, String gameType, String timeControl) {
        this.whitePlayerName = whitePlayerName;
        this.blackPlayerName = blackPlayerName;
        this.gameType = gameType != null ? gameType : "RAPID";
        this.timeControl = timeControl != null ? timeControl : "10m";
        this.startTime = Instant.now();
        this.status = GameStatus.IN_PROGRESS;
        this.result = GameResult.IN_PROGRESS;
        this.finalFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    }

    @PrePersist
    protected void onCreate() {
        if (this.startTime == null) {
            this.startTime = Instant.now();
        }
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public void addMove(Move move) {
        moves.add(move);
        move.setGame(this);
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public User getWhitePlayer() {
        return whitePlayer;
    }

    public void setWhitePlayer(User whitePlayer) {
        this.whitePlayer = whitePlayer;
    }

    public User getBlackPlayer() {
        return blackPlayer;
    }

    public void setBlackPlayer(User blackPlayer) {
        this.blackPlayer = blackPlayer;
    }

    public String getWhitePlayerName() {
        return whitePlayerName;
    }

    public void setWhitePlayerName(String whitePlayerName) {
        this.whitePlayerName = whitePlayerName;
    }

    public String getBlackPlayerName() {
        return blackPlayerName;
    }

    public void setBlackPlayerName(String blackPlayerName) {
        this.blackPlayerName = blackPlayerName;
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

    public String getGameType() {
        return gameType;
    }

    public void setGameType(String gameType) {
        this.gameType = gameType;
    }

    public String getTimeControl() {
        return timeControl;
    }

    public void setTimeControl(String timeControl) {
        this.timeControl = timeControl;
    }

    public Instant getStartTime() {
        return startTime;
    }

    public void setStartTime(Instant startTime) {
        this.startTime = startTime;
    }

    public Instant getEndTime() {
        return endTime;
    }

    public void setEndTime(Instant endTime) {
        this.endTime = endTime;
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

    public GameStatus getStatus() {
        return status;
    }

    public void setStatus(GameStatus status) {
        this.status = status;
    }

    public List<Move> getMoves() {
        return moves;
    }

    public void setMoves(List<Move> moves) {
        this.moves = moves;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
