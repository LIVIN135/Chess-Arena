package com.chessarena.dto.response;

import com.chessarena.entity.ChallengeStatus;
import java.time.Instant;
import java.util.UUID;

public class ChallengeResponse {
    private UUID id;
    private UUID challengerId;
    private String challengerUsername;
    private int challengerRating;
    private UUID challengedId;
    private String challengedUsername;
    private int challengedRating;
    private String timeControl;
    private String colorPreference;
    private ChallengeStatus status;
    private UUID gameId;
    private Instant createdAt;
    private boolean isChallenger;

    public ChallengeResponse() {
    }

    public ChallengeResponse(UUID id, UUID challengerId, String challengerUsername, int challengerRating,
                             UUID challengedId, String challengedUsername, int challengedRating,
                             String timeControl, String colorPreference, ChallengeStatus status,
                             UUID gameId, Instant createdAt, boolean isChallenger) {
        this.id = id;
        this.challengerId = challengerId;
        this.challengerUsername = challengerUsername;
        this.challengerRating = challengerRating;
        this.challengedId = challengedId;
        this.challengedUsername = challengedUsername;
        this.challengedRating = challengedRating;
        this.timeControl = timeControl;
        this.colorPreference = colorPreference;
        this.status = status;
        this.gameId = gameId;
        this.createdAt = createdAt;
        this.isChallenger = isChallenger;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getChallengerId() {
        return challengerId;
    }

    public void setChallengerId(UUID challengerId) {
        this.challengerId = challengerId;
    }

    public String getChallengerUsername() {
        return challengerUsername;
    }

    public void setChallengerUsername(String challengerUsername) {
        this.challengerUsername = challengerUsername;
    }

    public int getChallengerRating() {
        return challengerRating;
    }

    public void setChallengerRating(int challengerRating) {
        this.challengerRating = challengerRating;
    }

    public UUID getChallengedId() {
        return challengedId;
    }

    public void setChallengedId(UUID challengedId) {
        this.challengedId = challengedId;
    }

    public String getChallengedUsername() {
        return challengedUsername;
    }

    public void setChallengedUsername(String challengedUsername) {
        this.challengedUsername = challengedUsername;
    }

    public int getChallengedRating() {
        return challengedRating;
    }

    public void setChallengedRating(int challengedRating) {
        this.challengedRating = challengedRating;
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

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isChallenger() {
        return isChallenger;
    }

    public void setChallenger(boolean challenger) {
        isChallenger = challenger;
    }
}
