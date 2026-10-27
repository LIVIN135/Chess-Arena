package com.chessarena.dto.response;

import com.chessarena.entity.Tournament;
import com.chessarena.entity.TournamentStatus;
import com.chessarena.entity.TournamentType;

import java.time.LocalDateTime;

public class TournamentResponse {

    private Long id;
    private String name;
    private String description;
    private TournamentType type;
    private TournamentStatus status;
    private String timeControl;
    private Integer maxParticipants;
    private Integer currentParticipantsCount;
    private Integer roundsTotal;
    private Integer currentRound;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String createdByUsername;
    private LocalDateTime createdAt;

    public TournamentResponse() {}

    public static TournamentResponse fromEntity(Tournament t) {
        TournamentResponse resp = new TournamentResponse();
        resp.setId(t.getId());
        resp.setName(t.getName());
        resp.setDescription(t.getDescription());
        resp.setType(t.getType());
        resp.setStatus(t.getStatus());
        resp.setTimeControl(t.getTimeControl());
        resp.setMaxParticipants(t.getMaxParticipants());
        resp.setCurrentParticipantsCount(t.getCurrentParticipantsCount());
        resp.setRoundsTotal(t.getRoundsTotal());
        resp.setCurrentRound(t.getCurrentRound());
        resp.setStartTime(t.getStartTime());
        resp.setEndTime(t.getEndTime());
        if (t.getCreatedBy() != null) {
            resp.setCreatedByUsername(t.getCreatedBy().getUsername());
        }
        resp.setCreatedAt(t.getCreatedAt());
        return resp;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public TournamentType getType() {
        return type;
    }

    public void setType(TournamentType type) {
        this.type = type;
    }

    public TournamentStatus getStatus() {
        return status;
    }

    public void setStatus(TournamentStatus status) {
        this.status = status;
    }

    public String getTimeControl() {
        return timeControl;
    }

    public void setTimeControl(String timeControl) {
        this.timeControl = timeControl;
    }

    public Integer getMaxParticipants() {
        return maxParticipants;
    }

    public void setMaxParticipants(Integer maxParticipants) {
        this.maxParticipants = maxParticipants;
    }

    public Integer getCurrentParticipantsCount() {
        return currentParticipantsCount;
    }

    public void setCurrentParticipantsCount(Integer currentParticipantsCount) {
        this.currentParticipantsCount = currentParticipantsCount;
    }

    public Integer getRoundsTotal() {
        return roundsTotal;
    }

    public void setRoundsTotal(Integer roundsTotal) {
        this.roundsTotal = roundsTotal;
    }

    public Integer getCurrentRound() {
        return currentRound;
    }

    public void setCurrentRound(Integer currentRound) {
        this.currentRound = currentRound;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public String getCreatedByUsername() {
        return createdByUsername;
    }

    public void setCreatedByUsername(String createdByUsername) {
        this.createdByUsername = createdByUsername;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
