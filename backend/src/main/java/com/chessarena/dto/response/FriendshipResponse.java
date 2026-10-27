package com.chessarena.dto.response;

import com.chessarena.entity.FriendshipStatus;
import java.time.Instant;
import java.util.UUID;

public class FriendshipResponse {
    private UUID id;
    private UUID friendId;
    private String friendUsername;
    private String friendAvatarUrl;
    private String friendBio;
    private int friendRating;
    private int friendGamesPlayed;
    private double friendWinRate;
    private FriendshipStatus status;
    private boolean isRequester;
    private Instant createdAt;

    public FriendshipResponse() {
    }

    public FriendshipResponse(UUID id, UUID friendId, String friendUsername, String friendAvatarUrl,
                              String friendBio, int friendRating, int friendGamesPlayed, double friendWinRate,
                              FriendshipStatus status, boolean isRequester, Instant createdAt) {
        this.id = id;
        this.friendId = friendId;
        this.friendUsername = friendUsername;
        this.friendAvatarUrl = friendAvatarUrl;
        this.friendBio = friendBio;
        this.friendRating = friendRating;
        this.friendGamesPlayed = friendGamesPlayed;
        this.friendWinRate = friendWinRate;
        this.status = status;
        this.isRequester = isRequester;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getFriendId() {
        return friendId;
    }

    public void setFriendId(UUID friendId) {
        this.friendId = friendId;
    }

    public String getFriendUsername() {
        return friendUsername;
    }

    public void setFriendUsername(String friendUsername) {
        this.friendUsername = friendUsername;
    }

    public String getFriendAvatarUrl() {
        return friendAvatarUrl;
    }

    public void setFriendAvatarUrl(String friendAvatarUrl) {
        this.friendAvatarUrl = friendAvatarUrl;
    }

    public String getFriendBio() {
        return friendBio;
    }

    public void setFriendBio(String friendBio) {
        this.friendBio = friendBio;
    }

    public int getFriendRating() {
        return friendRating;
    }

    public void setFriendRating(int friendRating) {
        this.friendRating = friendRating;
    }

    public int getFriendGamesPlayed() {
        return friendGamesPlayed;
    }

    public void setFriendGamesPlayed(int friendGamesPlayed) {
        this.friendGamesPlayed = friendGamesPlayed;
    }

    public double getFriendWinRate() {
        return friendWinRate;
    }

    public void setFriendWinRate(double friendWinRate) {
        this.friendWinRate = friendWinRate;
    }

    public FriendshipStatus getStatus() {
        return status;
    }

    public void setStatus(FriendshipStatus status) {
        this.status = status;
    }

    public boolean isRequester() {
        return isRequester;
    }

    public void setRequester(boolean requester) {
        isRequester = requester;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
