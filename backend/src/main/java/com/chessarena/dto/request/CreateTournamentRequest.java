package com.chessarena.dto.request;

import com.chessarena.entity.TournamentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateTournamentRequest {

    @NotBlank(message = "Tournament name is required")
    @Size(min = 3, max = 120, message = "Tournament name must be between 3 and 120 characters")
    private String name;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @NotNull(message = "Tournament type is required")
    private TournamentType type = TournamentType.SWISS;

    @NotBlank(message = "Time control is required")
    private String timeControl = "5m";

    private Integer maxParticipants = 16;

    private Integer roundsTotal = 3;

    public CreateTournamentRequest() {}

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

    public Integer getRoundsTotal() {
        return roundsTotal;
    }

    public void setRoundsTotal(Integer roundsTotal) {
        this.roundsTotal = roundsTotal;
    }
}
