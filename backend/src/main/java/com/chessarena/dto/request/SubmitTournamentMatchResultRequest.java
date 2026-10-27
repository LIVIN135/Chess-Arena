package com.chessarena.dto.request;

import com.chessarena.entity.TournamentMatchResult;
import jakarta.validation.constraints.NotNull;

public class SubmitTournamentMatchResultRequest {

    @NotNull(message = "Match result is required")
    private TournamentMatchResult result;

    public SubmitTournamentMatchResultRequest() {}

    public SubmitTournamentMatchResultRequest(TournamentMatchResult result) {
        this.result = result;
    }

    public TournamentMatchResult getResult() {
        return result;
    }

    public void setResult(TournamentMatchResult result) {
        this.result = result;
    }
}
