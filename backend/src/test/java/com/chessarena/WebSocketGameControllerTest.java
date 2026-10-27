package com.chessarena;

import com.chessarena.security.RateLimitingService;
import com.chessarena.service.MatchmakingService;
import com.chessarena.websocket.GameRoom;
import com.chessarena.websocket.GameRoomManager;
import com.chessarena.websocket.WebSocketGameController;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class WebSocketGameControllerTest {

    private GameRoomManager roomManager;
    private MatchmakingService matchmakingService;
    private RateLimitingService rateLimitingService;
    private WebSocketGameController controller;

    @BeforeEach
    void setUp() {
        roomManager = mock(GameRoomManager.class);
        matchmakingService = mock(MatchmakingService.class);
        rateLimitingService = mock(RateLimitingService.class);
        when(rateLimitingService.tryConsumeMatchmaking(anyString())).thenReturn(true);

        controller = new WebSocketGameController(roomManager, matchmakingService, rateLimitingService);
    }

    @Test
    void testJoinDerivesPlayerIdFromPrincipalNotPayload() {
        Principal principal = () -> "actual_authenticated_user";
        Map<String, String> spoofedPayload = new HashMap<>();
        spoofedPayload.put("playerId", "impostor_victim_user");
        spoofedPayload.put("playerName", "Actual User");
        spoofedPayload.put("timeControl", "5m");

        controller.joinMatchmaking(spoofedPayload, principal);

        // Verify that MatchmakingService receives the Principal's name, ignoring spoofed playerId
        verify(matchmakingService, times(1)).joinQueue(eq("5m"), eq("actual_authenticated_user"), eq("Actual User"));
    }

    @Test
    void testJoinWithoutPrincipalIsRejected() {
        Map<String, String> payload = new HashMap<>();
        payload.put("timeControl", "5m");

        controller.joinMatchmaking(payload, null);

        verify(matchmakingService, never()).joinQueue(anyString(), anyString(), anyString());
    }

    @Test
    void testLeaveUsesPrincipalName() {
        Principal principal = () -> "player_alice";
        controller.leaveMatchmaking(principal);

        verify(matchmakingService, times(1)).leaveQueue("player_alice");
    }

    @Test
    void testResignDerivesPlayerIdentityFromPrincipal() {
        UUID gameId = UUID.randomUUID();
        GameRoom mockRoom = mock(GameRoom.class);
        when(mockRoom.isWhite("alice")).thenReturn(true);
        when(mockRoom.isBlack("alice")).thenReturn(false);
        when(roomManager.getRoom(gameId)).thenReturn(mockRoom);

        Principal principal = () -> "alice";
        controller.handleResign(gameId, principal);

        // Verify that finishGame was called with winner as Black because White (alice) resigned
        verify(roomManager, times(1)).finishGame(eq(mockRoom), eq("Black"), eq("White Resigned"), eq("0-1"));
    }
}
