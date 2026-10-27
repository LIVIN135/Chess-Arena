package com.chessarena.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "friend_challenges", indexes = {
    @Index(name = "idx_challenges_challenger", columnList = "challenger_id"),
    @Index(name = "idx_challenges_challenged", columnList = "challenged_id"),
    @Index(name = "idx_challenges_status", columnList = "status")
})
public class FriendChallenge {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "challenger_id", nullable = false)
    private User challenger;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "challenged_id", nullable = false)
    private User challenged;

    @Column(name = "time_control", nullable = false, length = 30)
    private String timeControl = "10m";

    @Column(name = "color_preference", nullable = false, length = 20)
    private String colorPreference = "RANDOM"; // "WHITE", "BLACK", "RANDOM"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ChallengeStatus status = ChallengeStatus.PENDING;

    @Column(name = "game_id")
    private UUID gameId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public FriendChallenge() {
    }

    public FriendChallenge(User challenger, User challenged, String timeControl, String colorPreference) {
        this.challenger = challenger;
        this.challenged = challenged;
        this.timeControl = timeControl != null ? timeControl : "10m";
        this.colorPreference = colorPreference != null ? colorPreference : "RANDOM";
        this.status = ChallengeStatus.PENDING;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public User getChallenger() {
        return challenger;
    }

    public void setChallenger(User challenger) {
        this.challenger = challenger;
    }

    public User getChallenged() {
        return challenged;
    }

    public void setChallenged(User challenged) {
        this.challenged = challenged;
    }

    public String getTimeControl() {
        return timeControl;
    }

    public void setTimeControl(String timeControl) {
        this.timeControl = timeControl;
    }

    public String getColorPreference() {
        return colorPreference;
    }

    public void setColorPreference(String colorPreference) {
        this.colorPreference = colorPreference;
    }

    public ChallengeStatus getStatus() {
        return status;
    }

    public void setStatus(ChallengeStatus status) {
        this.status = status;
    }

    public UUID getGameId() {
        return gameId;
    }

    public void setGameId(UUID gameId) {
        this.gameId = gameId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
