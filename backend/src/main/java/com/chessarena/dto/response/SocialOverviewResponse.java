package com.chessarena.dto.response;

import java.util.List;

public class SocialOverviewResponse {
    private List<FriendshipResponse> friends;
    private List<FriendshipResponse> requests;
    private List<ChallengeResponse> incomingChallenges;
    private List<ChallengeResponse> outgoingChallenges;

    public SocialOverviewResponse() {
    }

    public SocialOverviewResponse(List<FriendshipResponse> friends,
                                  List<FriendshipResponse> requests,
                                  List<ChallengeResponse> incomingChallenges,
                                  List<ChallengeResponse> outgoingChallenges) {
        this.friends = friends;
        this.requests = requests;
        this.incomingChallenges = incomingChallenges;
        this.outgoingChallenges = outgoingChallenges;
    }

    public List<FriendshipResponse> getFriends() {
        return friends;
    }

    public void setFriends(List<FriendshipResponse> friends) {
        this.friends = friends;
    }

    public List<FriendshipResponse> getRequests() {
        return requests;
    }

    public void setRequests(List<FriendshipResponse> requests) {
        this.requests = requests;
    }

    public List<ChallengeResponse> getIncomingChallenges() {
        return incomingChallenges;
    }

    public void setIncomingChallenges(List<ChallengeResponse> incomingChallenges) {
        this.incomingChallenges = incomingChallenges;
    }

    public List<ChallengeResponse> getOutgoingChallenges() {
        return outgoingChallenges;
    }

    public void setOutgoingChallenges(List<ChallengeResponse> outgoingChallenges) {
        this.outgoingChallenges = outgoingChallenges;
    }
}
