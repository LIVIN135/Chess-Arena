package com.chessarena.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "puzzle_attempts", indexes = {
    @Index(name = "idx_attempts_user", columnList = "user_id"),
    @Index(name = "idx_attempts_puzzle", columnList = "puzzle_id")
})
public class PuzzleAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "puzzle_id", nullable = false)
    private Puzzle puzzle;

    @Column(name = "is_solved", nullable = false)
    private boolean isSolved;

    @Column(name = "user_rating_before")
    private int userRatingBefore;

    @Column(name = "user_rating_after")
    private int userRatingAfter;

    @Column(name = "rating_change")
    private int ratingChange;

    @Column(name = "time_taken_seconds")
    private int timeTakenSeconds;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public PuzzleAttempt() {
    }

    public PuzzleAttempt(User user, Puzzle puzzle, boolean isSolved, int userRatingBefore, int userRatingAfter, int ratingChange, int timeTakenSeconds) {
        this.user = user;
        this.puzzle = puzzle;
        this.isSolved = isSolved;
        this.userRatingBefore = userRatingBefore;
        this.userRatingAfter = userRatingAfter;
        this.ratingChange = ratingChange;
        this.timeTakenSeconds = timeTakenSeconds;
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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Puzzle getPuzzle() {
        return puzzle;
    }

    public void setPuzzle(Puzzle puzzle) {
        this.puzzle = puzzle;
    }

    public boolean isSolved() {
        return isSolved;
    }

    public void setSolved(boolean solved) {
        isSolved = solved;
    }

    public int getUserRatingBefore() {
        return userRatingBefore;
    }

    public void setUserRatingBefore(int userRatingBefore) {
        this.userRatingBefore = userRatingBefore;
    }

    public int getUserRatingAfter() {
        return userRatingAfter;
    }

    public void setUserRatingAfter(int userRatingAfter) {
        this.userRatingAfter = userRatingAfter;
    }

    public int getRatingChange() {
        return ratingChange;
    }

    public void setRatingChange(int ratingChange) {
        this.ratingChange = ratingChange;
    }

    public int getTimeTakenSeconds() {
        return timeTakenSeconds;
    }

    public void setTimeTakenSeconds(int timeTakenSeconds) {
        this.timeTakenSeconds = timeTakenSeconds;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
