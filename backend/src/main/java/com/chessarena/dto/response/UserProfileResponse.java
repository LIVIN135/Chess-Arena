package com.chessarena.dto.response;

import com.chessarena.entity.UserRole;
import java.time.Instant;
import java.util.UUID;

public class UserProfileResponse {
    private UUID id;
    private String username;
    private String email;
    private UserRole role;
    private String avatarUrl;
    private Instant createdAt;

    private String bio;
    private int rating;
    private int gamesPlayed;
    private int gamesWon;
    private int gamesLost;
    private int gamesDrawn;
    private double winRate;

    public UserProfileResponse() {
    }

    public UserProfileResponse(UUID id, String username, String email, UserRole role, String avatarUrl, Instant createdAt) {
        this(id, username, email, role, avatarUrl, createdAt, "Chess enthusiast playing on Chess Arena", 1200, 0, 0, 0, 0);
    }

    public UserProfileResponse(UUID id, String username, String email, UserRole role, String avatarUrl, Instant createdAt,
                               String bio, int rating, int gamesPlayed, int gamesWon, int gamesLost, int gamesDrawn) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.avatarUrl = avatarUrl;
        this.createdAt = createdAt;
        this.bio = bio;
        this.rating = rating;
        this.gamesPlayed = gamesPlayed;
        this.gamesWon = gamesWon;
        this.gamesLost = gamesLost;
        this.gamesDrawn = gamesDrawn;
        this.winRate = gamesPlayed > 0 ? Math.round(((double) gamesWon / gamesPlayed) * 1000.0) / 10.0 : 0.0;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public int getGamesPlayed() {
        return gamesPlayed;
    }

    public void setGamesPlayed(int gamesPlayed) {
        this.gamesPlayed = gamesPlayed;
    }

    public int getGamesWon() {
        return gamesWon;
    }

    public void setGamesWon(int gamesWon) {
        this.gamesWon = gamesWon;
    }

    public int getGamesLost() {
        return gamesLost;
    }

    public void setGamesLost(int gamesLost) {
        this.gamesLost = gamesLost;
    }

    public int getGamesDrawn() {
        return gamesDrawn;
    }

    public void setGamesDrawn(int gamesDrawn) {
        this.gamesDrawn = gamesDrawn;
    }

    public double getWinRate() {
        return winRate;
    }

    public void setWinRate(double winRate) {
        this.winRate = winRate;
    }
}
