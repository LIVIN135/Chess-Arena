package com.chessarena.controller;

import com.chessarena.dto.request.CreateChallengeRequest;
import com.chessarena.dto.request.UpdateBioRequest;
import com.chessarena.dto.response.*;
import com.chessarena.entity.User;
import com.chessarena.service.SocialService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/social")
public class SocialController {

    private final SocialService socialService;

    public SocialController(SocialService socialService) {
        this.socialService = socialService;
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<ApiResponse<List<LeaderboardEntryResponse>>> getLeaderboard() {
        List<LeaderboardEntryResponse> leaderboard = socialService.getLeaderboard();
        return ResponseEntity.ok(ApiResponse.ok("Leaderboard fetched successfully", leaderboard));
    }

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<com.chessarena.dto.response.SocialOverviewResponse>> getOverview(
            @AuthenticationPrincipal User currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Authentication required"));
        }
        com.chessarena.dto.response.SocialOverviewResponse overview = socialService.getSocialOverview(currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Social overview retrieved", overview));
    }

    @GetMapping("/users/search")
    public ResponseEntity<ApiResponse<List<UserProfileResponse>>> searchUsers(@RequestParam("q") String query) {
        List<UserProfileResponse> users = socialService.searchUsers(query);
        return ResponseEntity.ok(ApiResponse.ok("Users found", users));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getUserProfile(@PathVariable("id") UUID userId) {
        UserProfileResponse profile = socialService.getUserProfile(userId);
        return ResponseEntity.ok(ApiResponse.ok("User profile retrieved", profile));
    }

    @GetMapping("/users/username/{username}")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getUserProfileByUsername(@PathVariable("username") String username) {
        UserProfileResponse profile = socialService.getUserProfileByUsername(username);
        return ResponseEntity.ok(ApiResponse.ok("User profile retrieved", profile));
    }

    @PutMapping("/profile/bio")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateBio(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody UpdateBioRequest request
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Authentication required"));
        }
        UserProfileResponse response = socialService.updateBio(currentUser, request);
        return ResponseEntity.ok(ApiResponse.ok("Bio updated successfully", response));
    }

    @PostMapping("/friends/request/{targetUserId}")
    public ResponseEntity<ApiResponse<FriendshipResponse>> sendFriendRequest(
            @AuthenticationPrincipal User currentUser,
            @PathVariable("targetUserId") UUID targetUserId
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Authentication required"));
        }
        FriendshipResponse response = socialService.sendFriendRequest(currentUser, targetUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Friend request sent", response));
    }

    @PostMapping("/friends/{id}/accept")
    public ResponseEntity<ApiResponse<FriendshipResponse>> acceptFriendRequest(
            @AuthenticationPrincipal User currentUser,
            @PathVariable("id") UUID friendshipId
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Authentication required"));
        }
        FriendshipResponse response = socialService.acceptFriendRequest(currentUser, friendshipId);
        return ResponseEntity.ok(ApiResponse.ok("Friend request accepted", response));
    }

    @PostMapping("/friends/{id}/decline")
    public ResponseEntity<ApiResponse<FriendshipResponse>> declineFriendRequest(
            @AuthenticationPrincipal User currentUser,
            @PathVariable("id") UUID friendshipId
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Authentication required"));
        }
        FriendshipResponse response = socialService.declineFriendRequest(currentUser, friendshipId);
        return ResponseEntity.ok(ApiResponse.ok("Friend request declined", response));
    }

    @DeleteMapping("/friends/{id}")
    public ResponseEntity<ApiResponse<Void>> removeFriend(
            @AuthenticationPrincipal User currentUser,
            @PathVariable("id") UUID friendshipId
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Authentication required"));
        }
        socialService.removeFriend(currentUser, friendshipId);
        return ResponseEntity.ok(ApiResponse.ok("Friend removed successfully", null));
    }

    @GetMapping("/friends")
    public ResponseEntity<ApiResponse<List<FriendshipResponse>>> getFriends(
            @AuthenticationPrincipal User currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Authentication required"));
        }
        List<FriendshipResponse> friends = socialService.getFriends(currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Friends retrieved", friends));
    }

    @GetMapping("/friends/requests")
    public ResponseEntity<ApiResponse<List<FriendshipResponse>>> getFriendRequests(
            @AuthenticationPrincipal User currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Authentication required"));
        }
        List<FriendshipResponse> requests = socialService.getPendingRequests(currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Friend requests retrieved", requests));
    }

    @PostMapping("/challenges")
    public ResponseEntity<ApiResponse<ChallengeResponse>> createChallenge(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody CreateChallengeRequest request
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Authentication required"));
        }
        ChallengeResponse response = socialService.createChallenge(currentUser, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Challenge sent successfully", response));
    }

    @PostMapping("/challenges/{id}/accept")
    public ResponseEntity<ApiResponse<ChallengeResponse>> acceptChallenge(
            @AuthenticationPrincipal User currentUser,
            @PathVariable("id") UUID challengeId
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Authentication required"));
        }
        ChallengeResponse response = socialService.acceptChallenge(currentUser, challengeId);
        return ResponseEntity.ok(ApiResponse.ok("Challenge accepted, game created!", response));
    }

    @PostMapping("/challenges/{id}/decline")
    public ResponseEntity<ApiResponse<ChallengeResponse>> declineChallenge(
            @AuthenticationPrincipal User currentUser,
            @PathVariable("id") UUID challengeId
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Authentication required"));
        }
        ChallengeResponse response = socialService.declineChallenge(currentUser, challengeId);
        return ResponseEntity.ok(ApiResponse.ok("Challenge declined", response));
    }

    @GetMapping("/challenges/pending")
    public ResponseEntity<ApiResponse<List<ChallengeResponse>>> getPendingChallenges(
            @AuthenticationPrincipal User currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Authentication required"));
        }
        List<ChallengeResponse> challenges = socialService.getPendingChallenges(currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Pending challenges retrieved", challenges));
    }
}
