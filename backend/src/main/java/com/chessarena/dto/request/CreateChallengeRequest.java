package com.chessarena.dto.request;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class CreateChallengeRequest {

    @NotNull(message = "Target user ID cannot be null")
    private UUID targetUserId;

    private String timeControl = "10m";

    private String colorPreference = "RANDOM";

    public CreateChallengeRequest() {
    }

    public CreateChallengeRequest(UUID targetUserId, String timeControl, String colorPreference) {
        this.targetUserId = targetUserId;
        this.timeControl = timeControl != null ? timeControl : "10m";
        this.colorPreference = colorPreference != null ? colorPreference : "RANDOM";
    }

    public UUID getTargetUserId() {
        return targetUserId;
    }

    public void setTargetUserId(UUID targetUserId) {
        this.targetUserId = targetUserId;
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
}
