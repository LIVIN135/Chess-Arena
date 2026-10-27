package com.chessarena.dto.response;

import com.chessarena.entity.TournamentParticipant;
import java.util.UUID;

public class TournamentParticipantResponse {

    private Long id;
    private UUID userId;
    private String username;
    private Integer rating;
    private Double score;
    private Double tieBreak;
    private Integer wins;
    private Integer draws;
    private Integer losses;
    private Integer rank;
    private Boolean active;

    public TournamentParticipantResponse() {}

    public static TournamentParticipantResponse fromEntity(TournamentParticipant p) {
        TournamentParticipantResponse resp = new TournamentParticipantResponse();
        resp.setId(p.getId());
        if (p.getUser() != null) {
            resp.setUserId(p.getUser().getId());
            resp.setUsername(p.getUser().getUsername());
            resp.setRating(p.getUser().getRating());
        }
        resp.setScore(p.getScore());
        resp.setTieBreak(p.getTieBreak());
        resp.setWins(p.getWins());
        resp.setDraws(p.getDraws());
        resp.setLosses(p.getLosses());
        resp.setRank(p.getRank());
        resp.setActive(p.getActive());
        return resp;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public Double getScore() {
        return score;
    }

    public void setScore(Double score) {
        this.score = score;
    }

    public Double getTieBreak() {
        return tieBreak;
    }

    public void setTieBreak(Double tieBreak) {
        this.tieBreak = tieBreak;
    }

    public Integer getWins() {
        return wins;
    }

    public void setWins(Integer wins) {
        this.wins = wins;
    }

    public Integer getDraws() {
        return draws;
    }

    public void setDraws(Integer draws) {
        this.draws = draws;
    }

    public Integer getLosses() {
        return losses;
    }

    public void setLosses(Integer losses) {
        this.losses = losses;
    }

    public Integer getRank() {
        return rank;
    }

    public void setRank(Integer rank) {
        this.rank = rank;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
