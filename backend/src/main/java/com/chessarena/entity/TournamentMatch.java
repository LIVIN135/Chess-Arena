package com.chessarena.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tournament_matches")
public class TournamentMatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tournament_id", nullable = false)
    private Tournament tournament;

    @Column(name = "round_number", nullable = false)
    private Integer roundNumber;

    @Column(name = "board_number", nullable = false)
    private Integer boardNumber = 1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "white_player_user_id")
    private User whitePlayer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "black_player_user_id")
    private User blackPlayer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TournamentMatchResult result = TournamentMatchResult.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TournamentMatchStatus status = TournamentMatchStatus.SCHEDULED;

    @Column(name = "game_session_id", length = 64)
    private String gameSessionId;

    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt = LocalDateTime.now();

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    public TournamentMatch() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Tournament getTournament() {
        return tournament;
    }

    public void setTournament(Tournament tournament) {
        this.tournament = tournament;
    }

    public Integer getRoundNumber() {
        return roundNumber;
    }

    public void setRoundNumber(Integer roundNumber) {
        this.roundNumber = roundNumber;
    }

    public Integer getBoardNumber() {
        return boardNumber;
    }

    public void setBoardNumber(Integer boardNumber) {
        this.boardNumber = boardNumber;
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

    public TournamentMatchResult getResult() {
        return result;
    }

    public void setResult(TournamentMatchResult result) {
        this.result = result;
    }

    public TournamentMatchStatus getStatus() {
        return status;
    }

    public void setStatus(TournamentMatchStatus status) {
        this.status = status;
    }

    public String getGameSessionId() {
        return gameSessionId;
    }

    public void setGameSessionId(String gameSessionId) {
        this.gameSessionId = gameSessionId;
    }

    public LocalDateTime getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(LocalDateTime scheduledAt) {
        this.scheduledAt = scheduledAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}
