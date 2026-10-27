package com.chessarena.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

public class SubmitPuzzleAttemptRequest {

    @JsonProperty("isSolved")
    @JsonAlias({"solved", "isSolved"})
    private boolean isSolved;

    private int timeTakenSeconds = 0;

    public SubmitPuzzleAttemptRequest() {
    }

    public SubmitPuzzleAttemptRequest(boolean isSolved, int timeTakenSeconds) {
        this.isSolved = isSolved;
        this.timeTakenSeconds = timeTakenSeconds;
    }

    public boolean isSolved() {
        return isSolved;
    }

    public void setSolved(boolean solved) {
        this.isSolved = solved;
    }

    public void setIsSolved(boolean isSolved) {
        this.isSolved = isSolved;
    }

    public int getTimeTakenSeconds() {
        return timeTakenSeconds;
    }

    public void setTimeTakenSeconds(int timeTakenSeconds) {
        this.timeTakenSeconds = timeTakenSeconds;
    }
}
