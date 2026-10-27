package com.chessarena.dto.response;

import com.chessarena.entity.TournamentMatch;
import com.chessarena.entity.TournamentMatchResult;
import com.chessarena.entity.TournamentMatchStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public class TournamentMatchResponse {

    private Long id;
    private Integer roundNumber;
    private Integer boardNumber;
    private UUID whitePlayerId;
    private String whitePlayerUsername;
    private Integer whitePlayerRating;
    private UUID blackPlayerId;
    private String blackPlayerUsername;
    private Integer blackPlayerRating;
    private TournamentMatchResult result;
    private TournamentMatchStatus status;
    private String gameSessionId;
    private LocalDateTime scheduledAt;
    private LocalDateTime completedAt;

    public TournamentMatchResponse() {}

    public static TournamentMatchResponse fromEntity(TournamentMatch m) {
        TournamentMatchResponse resp = new TournamentMatchResponse();
        resp.setId(m.getId());
        resp.setRoundNumber(m.getRoundNumber());
        resp.setBoardNumber(m.getBoardNumber());
        if (m.getWhitePlayer() != null) {
            resp.setWhitePlayerId(m.getWhitePlayer().getId());
            resp.setWhitePlayerUsername(m.getWhitePlayer().getUsername());
            resp.setWhitePlayerRating(m.getWhitePlayer().getRating());
        }
        if (m.getBlackPlayer() != null) {
            resp.setBlackPlayerId(m.getBlackPlayer().getId());
            resp.setBlackPlayerUsername(m.getBlackPlayer().getUsername());
            resp.setBlackPlayerRating(m.getBlackPlayer().getRating());
        }
        resp.setResult(m.getResult());
        resp.setStatus(m.getStatus());
        resp.setGameSessionId(m.getGameSessionId());
        resp.setScheduledAt(m.getScheduledAt());
        resp.setCompletedAt(m.getCompletedAt());
        return resp;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public UUID getWhitePlayerId() {
        return whitePlayerId;
    }

    public void setWhitePlayerId(UUID whitePlayerId) {
        this.whitePlayerId = whitePlayerId;
    }

    public String getWhitePlayerUsername() {
        return whitePlayerUsername;
    }

    public void setWhitePlayerUsername(String whitePlayerUsername) {
        this.whitePlayerUsername = whitePlayerUsername;
    }

    public Integer getWhitePlayerRating() {
        return whitePlayerRating;
    }

    public void setWhitePlayerRating(Integer whitePlayerRating) {
        this.whitePlayerRating = whitePlayerRating;
    }

    public UUID getBlackPlayerId() {
        return blackPlayerId;
    }

    public void setBlackPlayerId(UUID blackPlayerId) {
        this.blackPlayerId = blackPlayerId;
    }

    public String getBlackPlayerUsername() {
        return blackPlayerUsername;
    }

    public void setBlackPlayerUsername(String blackPlayerUsername) {
        this.blackPlayerUsername = blackPlayerUsername;
    }

    public Integer getBlackPlayerRating() {
        return blackPlayerRating;
    }

    public void setBlackPlayerRating(Integer blackPlayerRating) {
        this.blackPlayerRating = blackPlayerRating;
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
