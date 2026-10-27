package com.chessarena.service;

import com.chessarena.dto.request.CreateChallengeRequest;
import com.chessarena.dto.request.UpdateBioRequest;
import com.chessarena.dto.response.ChallengeResponse;
import com.chessarena.dto.response.FriendshipResponse;
import com.chessarena.dto.response.LeaderboardEntryResponse;
import com.chessarena.dto.response.UserProfileResponse;
import com.chessarena.entity.*;
import com.chessarena.repository.FriendChallengeRepository;
import com.chessarena.repository.FriendshipRepository;
import com.chessarena.repository.GameRepository;
import com.chessarena.repository.UserRepository;
import com.chessarena.websocket.GameRoom;
import com.chessarena.websocket.GameRoomManager;
import com.chessarena.websocket.dto.MatchFoundEvent;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
public class SocialService {

    private final UserRepository userRepository;
    private final FriendshipRepository friendshipRepository;
    private final FriendChallengeRepository challengeRepository;
    private final GameRepository gameRepository;
    private final GameRoomManager roomManager;
    private final SimpMessagingTemplate messagingTemplate;

    public SocialService(UserRepository userRepository,
                         FriendshipRepository friendshipRepository,
                         FriendChallengeRepository challengeRepository,
                         GameRepository gameRepository,
                         GameRoomManager roomManager,
                         SimpMessagingTemplate messagingTemplate) {
        this.userRepository = userRepository;
        this.friendshipRepository = friendshipRepository;
        this.challengeRepository = challengeRepository;
        this.gameRepository = gameRepository;
        this.roomManager = roomManager;
        this.messagingTemplate = messagingTemplate;
    }

    @org.springframework.cache.annotation.Cacheable("leaderboard")
    @Transactional(readOnly = true)
    public List<LeaderboardEntryResponse> getLeaderboard() {
        List<User> topUsers = userRepository.findTop50ByOrderByRatingDesc();
        AtomicInteger rank = new AtomicInteger(1);
        return topUsers.stream()
                .map(u -> new LeaderboardEntryResponse(
                        rank.getAndIncrement(),
                        u.getId(),
                        u.getUsername(),
                        u.getAvatarUrl(),
                        u.getBio(),
                        u.getRating(),
                        u.getGamesPlayed(),
                        u.getGamesWon(),
                        u.getGamesLost(),
                        u.getGamesDrawn()
                ))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserProfileResponse> searchUsers(String query) {
        if (query == null || query.trim().length() < 2) {
            return Collections.emptyList();
        }
        return userRepository.findByUsernameContainingIgnoreCase(query.trim())
                .stream()
                .limit(20)
                .map(this::toUserProfileResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getUserProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
        return toUserProfileResponse(user);
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getUserProfileByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found with username: " + username));
        return toUserProfileResponse(user);
    }

    @Transactional
    public UserProfileResponse updateBio(User user, UpdateBioRequest request) {
        User managedUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        managedUser.setBio(request.getBio());
        User updated = userRepository.save(managedUser);
        return toUserProfileResponse(updated);
    }

    @Transactional
    public FriendshipResponse sendFriendRequest(User requester, UUID targetUserId) {
        if (requester.getId().equals(targetUserId)) {
            throw new IllegalArgumentException("Cannot send friend request to yourself");
        }

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("Target user not found"));

        Optional<Friendship> existing = friendshipRepository.findBetweenUsers(requester, targetUser);
        if (existing.isPresent()) {
            Friendship f = existing.get();
            if (f.getStatus() == FriendshipStatus.ACCEPTED) {
                throw new IllegalStateException("Already friends with this user");
            }
            if (f.getStatus() == FriendshipStatus.PENDING) {
                throw new IllegalStateException("A friend request is already pending between both users");
            }
            // If declined previously, reactivate request from current user
            f.setRequester(requester);
            f.setAddressee(targetUser);
            f.setStatus(FriendshipStatus.PENDING);
            Friendship saved = friendshipRepository.save(f);
            return toFriendshipResponse(saved, requester);
        }

        Friendship friendship = new Friendship(requester, targetUser, FriendshipStatus.PENDING);
        Friendship saved = friendshipRepository.save(friendship);
        return toFriendshipResponse(saved, requester);
    }

    @Transactional
    public FriendshipResponse acceptFriendRequest(User user, UUID friendshipId) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new IllegalArgumentException("Friend request not found"));

        if (!friendship.getAddressee().getId().equals(user.getId())) {
            throw new IllegalStateException("Only the recipient can accept a friend request");
        }

        friendship.setStatus(FriendshipStatus.ACCEPTED);
        Friendship saved = friendshipRepository.save(friendship);
        return toFriendshipResponse(saved, user);
    }

    @Transactional
    public FriendshipResponse declineFriendRequest(User user, UUID friendshipId) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new IllegalArgumentException("Friend request not found"));

        if (!friendship.getAddressee().getId().equals(user.getId()) &&
            !friendship.getRequester().getId().equals(user.getId())) {
            throw new IllegalStateException("Not authorized to decline or cancel this friend request");
        }

        friendship.setStatus(FriendshipStatus.DECLINED);
        Friendship saved = friendshipRepository.save(friendship);
        return toFriendshipResponse(saved, user);
    }

    @Transactional
    public void removeFriend(User user, UUID friendshipId) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new IllegalArgumentException("Friendship not found"));

        if (!friendship.getAddressee().getId().equals(user.getId()) &&
            !friendship.getRequester().getId().equals(user.getId())) {
            throw new IllegalStateException("Not authorized to remove this friendship");
        }

        friendshipRepository.delete(friendship);
    }

    @Transactional(readOnly = true)
    public List<FriendshipResponse> getFriends(User user) {
        return friendshipRepository.findAllFriendsForUser(user, FriendshipStatus.ACCEPTED)
                .stream()
                .map(f -> toFriendshipResponse(f, user))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FriendshipResponse> getPendingRequests(User user) {
        List<Friendship> incoming = friendshipRepository.findPendingIncomingRequests(user);
        List<Friendship> outgoing = friendshipRepository.findPendingOutgoingRequests(user);

        List<FriendshipResponse> responses = new ArrayList<>();
        incoming.forEach(f -> responses.add(toFriendshipResponse(f, user)));
        outgoing.forEach(f -> responses.add(toFriendshipResponse(f, user)));
        return responses;
    }

    @Transactional
    public ChallengeResponse createChallenge(User challenger, CreateChallengeRequest request) {
        if (challenger.getId().equals(request.getTargetUserId())) {
            throw new IllegalArgumentException("Cannot challenge yourself");
        }

        User challenged = userRepository.findById(request.getTargetUserId())
                .orElseThrow(() -> new IllegalArgumentException("Target user not found"));

        FriendChallenge challenge = new FriendChallenge(
                challenger,
                challenged,
                request.getTimeControl(),
                request.getColorPreference()
        );

        FriendChallenge saved = challengeRepository.save(challenge);
        ChallengeResponse response = toChallengeResponse(saved, challenger);

        // Notify challenged user over websocket topic if listening
        try {
            messagingTemplate.convertAndSend("/topic/player/" + challenged.getUsername() + "/challenge", response);
            messagingTemplate.convertAndSend("/topic/player/" + challenged.getId().toString() + "/challenge", response);
        } catch (Exception ignored) {
        }

        return response;
    }

    @Transactional
    public ChallengeResponse acceptChallenge(User user, UUID challengeId) {
        FriendChallenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new IllegalArgumentException("Challenge not found"));

        if (!challenge.getChallenged().getId().equals(user.getId())) {
            throw new IllegalStateException("Only the challenged player can accept this challenge");
        }

        if (challenge.getStatus() != ChallengeStatus.PENDING) {
            throw new IllegalStateException("Challenge is no longer pending");
        }

        User challenger = challenge.getChallenger();
        User challenged = challenge.getChallenged();

        // Determine colors
        User whiteUser;
        User blackUser;
        String pref = challenge.getColorPreference();
        if ("WHITE".equalsIgnoreCase(pref)) {
            whiteUser = challenger;
            blackUser = challenged;
        } else if ("BLACK".equalsIgnoreCase(pref)) {
            whiteUser = challenged;
            blackUser = challenger;
        } else {
            // RANDOM
            if (Math.random() < 0.5) {
                whiteUser = challenger;
                blackUser = challenged;
            } else {
                whiteUser = challenged;
                blackUser = challenger;
            }
        }

        // Create persistent Game session
        String tc = challenge.getTimeControl();
        Game game = new Game(whiteUser.getUsername(), blackUser.getUsername(), "CHALLENGE_" + tc.toUpperCase(), tc);
        game.setWhitePlayer(whiteUser);
        game.setBlackPlayer(blackUser);
        game.setStatus(GameStatus.IN_PROGRESS);
        Game savedGame = gameRepository.save(game);

        // Setup WebSocket GameRoom
        long initialTimeMs = parseTimeToMs(tc);
        GameRoom room = roomManager.createRoom(
                savedGame.getId(),
                whiteUser.getUsername(),
                blackUser.getUsername(),
                whiteUser.getUsername(),
                blackUser.getUsername(),
                tc,
                initialTimeMs
        );

        challenge.setStatus(ChallengeStatus.ACCEPTED);
        challenge.setGameId(savedGame.getId());
        FriendChallenge savedChallenge = challengeRepository.save(challenge);

        // Broadcast MatchFound events to both players
        MatchFoundEvent eventWhite = new MatchFoundEvent(
                savedGame.getId(),
                "white",
                blackUser.getUsername(),
                tc,
                room.getCurrentFen()
        );

        MatchFoundEvent eventBlack = new MatchFoundEvent(
                savedGame.getId(),
                "black",
                whiteUser.getUsername(),
                tc,
                room.getCurrentFen()
        );

        try {
            messagingTemplate.convertAndSend("/topic/player/" + whiteUser.getUsername() + "/match", eventWhite);
            messagingTemplate.convertAndSend("/topic/player/" + blackUser.getUsername() + "/match", eventBlack);
            messagingTemplate.convertAndSend("/topic/player/" + whiteUser.getId().toString() + "/match", eventWhite);
            messagingTemplate.convertAndSend("/topic/player/" + blackUser.getId().toString() + "/match", eventBlack);
        } catch (Exception ignored) {
        }

        return toChallengeResponse(savedChallenge, user);
    }

    @Transactional
    public ChallengeResponse declineChallenge(User user, UUID challengeId) {
        FriendChallenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new IllegalArgumentException("Challenge not found"));

        if (!challenge.getChallenged().getId().equals(user.getId()) &&
            !challenge.getChallenger().getId().equals(user.getId())) {
            throw new IllegalStateException("Not authorized to decline this challenge");
        }

        challenge.setStatus(challenge.getChallenger().getId().equals(user.getId()) ? ChallengeStatus.CANCELLED : ChallengeStatus.DECLINED);
        FriendChallenge saved = challengeRepository.save(challenge);
        return toChallengeResponse(saved, user);
    }

    @Transactional(readOnly = true)
    public List<ChallengeResponse> getPendingChallenges(User user) {
        List<FriendChallenge> incoming = challengeRepository.findPendingChallengesForUser(user);
        List<FriendChallenge> outgoing = challengeRepository.findPendingChallengesSentByUser(user);

        List<ChallengeResponse> responses = new ArrayList<>();
        incoming.forEach(c -> responses.add(toChallengeResponse(c, user)));
        outgoing.forEach(c -> responses.add(toChallengeResponse(c, user)));
        return responses;
    }

    @Transactional(readOnly = true)
    public com.chessarena.dto.response.SocialOverviewResponse getSocialOverview(User user) {
        List<FriendshipResponse> friends = getFriends(user);
        List<FriendshipResponse> requests = getPendingRequests(user);
        List<FriendChallenge> incoming = challengeRepository.findPendingChallengesForUser(user);
        List<FriendChallenge> outgoing = challengeRepository.findPendingChallengesSentByUser(user);

        List<ChallengeResponse> incResponses = incoming.stream()
                .map(c -> toChallengeResponse(c, user))
                .collect(Collectors.toList());
        List<ChallengeResponse> outResponses = outgoing.stream()
                .map(c -> toChallengeResponse(c, user))
                .collect(Collectors.toList());

        return new com.chessarena.dto.response.SocialOverviewResponse(friends, requests, incResponses, outResponses);
    }

    private UserProfileResponse toUserProfileResponse(User u) {
        return new UserProfileResponse(
                u.getId(),
                u.getUsername(),
                u.getEmail(),
                u.getRole(),
                u.getAvatarUrl(),
                u.getCreatedAt(),
                u.getBio(),
                u.getRating(),
                u.getGamesPlayed(),
                u.getGamesWon(),
                u.getGamesLost(),
                u.getGamesDrawn()
        );
    }

    private FriendshipResponse toFriendshipResponse(Friendship f, User currentUser) {
        boolean isRequester = f.getRequester().getId().equals(currentUser.getId());
        User friend = isRequester ? f.getAddressee() : f.getRequester();
        double winRate = friend.getGamesPlayed() > 0 ?
                Math.round(((double) friend.getGamesWon() / friend.getGamesPlayed()) * 1000.0) / 10.0 : 0.0;

        return new FriendshipResponse(
                f.getId(),
                friend.getId(),
                friend.getUsername(),
                friend.getAvatarUrl(),
                friend.getBio(),
                friend.getRating(),
                friend.getGamesPlayed(),
                winRate,
                f.getStatus(),
                isRequester,
                f.getCreatedAt()
        );
    }

    private ChallengeResponse toChallengeResponse(FriendChallenge c, User currentUser) {
        boolean isChallenger = c.getChallenger().getId().equals(currentUser.getId());
        return new ChallengeResponse(
                c.getId(),
                c.getChallenger().getId(),
                c.getChallenger().getUsername(),
                c.getChallenger().getRating(),
                c.getChallenged().getId(),
                c.getChallenged().getUsername(),
                c.getChallenged().getRating(),
                c.getTimeControl(),
                c.getColorPreference(),
                c.getStatus(),
                c.getGameId(),
                c.getCreatedAt(),
                isChallenger
        );
    }

    private long parseTimeToMs(String tc) {
        if (tc == null) return 600000;
        if (tc.contains("1m")) return 60000;
        if (tc.contains("3m")) return 180000;
        if (tc.contains("5m")) return 300000;
        return 600000;
    }
}
