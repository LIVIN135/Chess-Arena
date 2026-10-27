package com.chessarena.dto.response;

import java.util.ArrayList;
import java.util.List;

public class TournamentDetailsResponse {

    private TournamentResponse tournament;
    private List<TournamentParticipantResponse> participants = new ArrayList<>();
    private List<TournamentMatchResponse> currentRoundMatches = new ArrayList<>();
    private List<TournamentMatchResponse> allMatches = new ArrayList<>();
    private Boolean isUserRegistered = false;
    private Boolean isUserCreator = false;

    public TournamentDetailsResponse() {}

    public TournamentResponse getTournament() {
        return tournament;
    }

    public void setTournament(TournamentResponse tournament) {
        this.tournament = tournament;
    }

    public List<TournamentParticipantResponse> getParticipants() {
        return participants;
    }

    public void setParticipants(List<TournamentParticipantResponse> participants) {
        this.participants = participants;
    }

    public List<TournamentMatchResponse> getCurrentRoundMatches() {
        return currentRoundMatches;
    }

    public void setCurrentRoundMatches(List<TournamentMatchResponse> currentRoundMatches) {
        this.currentRoundMatches = currentRoundMatches;
    }

    public List<TournamentMatchResponse> getAllMatches() {
        return allMatches;
    }

    public void setAllMatches(List<TournamentMatchResponse> allMatches) {
        this.allMatches = allMatches;
    }

    public Boolean getIsUserRegistered() {
        return isUserRegistered;
    }

    public void setIsUserRegistered(Boolean isUserRegistered) {
        this.isUserRegistered = isUserRegistered;
    }

    public Boolean getIsUserCreator() {
        return isUserCreator;
    }

    public void setIsUserCreator(Boolean isUserCreator) {
        this.isUserCreator = isUserCreator;
    }
}
