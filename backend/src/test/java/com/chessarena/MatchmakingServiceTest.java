package com.chessarena;

import com.chessarena.entity.Game;
import com.chessarena.repository.GameRepository;
import com.chessarena.service.MatchmakingService;
import com.chessarena.websocket.GameRoom;
import com.chessarena.websocket.GameRoomManager;
import com.chessarena.websocket.dto.MatchFoundEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class MatchmakingServiceTest {

    private GameRepository gameRepository;
    private GameRoomManager roomManager;
    private SimpMessagingTemplate messagingTemplate;
    private MatchmakingService matchmakingService;

    @BeforeEach
    void setUp() {
        gameRepository = mock(GameRepository.class);
        roomManager = mock(GameRoomManager.class);
        messagingTemplate = mock(SimpMessagingTemplate.class);
        matchmakingService = new MatchmakingService(gameRepository, roomManager, messagingTemplate);
    }

    @Test
    void testSinglePlayerWaitsInQueue() {
        matchmakingService.joinQueue("5m", "player_1", "Player One");

        // No match should be created yet
        verify(gameRepository, never()).save(any(Game.class));
        verify(roomManager, never()).createRoom(any(), any(), any(), any(), any(), any(), anyLong());
        verify(messagingTemplate, never()).convertAndSendToUser(any(), any(), any());
    }

    @Test
    void testTwoPlayersSameTimeControlArePaired() {
        UUID gameId = UUID.randomUUID();
        Game mockSavedGame = new Game("Player One", "Player Two", "ONLINE_5M", "5m");
        mockSavedGame.setId(gameId);
        when(gameRepository.save(any(Game.class))).thenReturn(mockSavedGame);

        GameRoom mockRoom = new GameRoom(gameId, "player_1", "player_2", "Player One", "Player Two", "5m", 300000L);
        when(roomManager.createRoom(eq(gameId), anyString(), anyString(), anyString(), anyString(), eq("5m"), eq(300000L)))
                .thenReturn(mockRoom);

        // First player joins
        matchmakingService.joinQueue("5m", "player_1", "Player One");

        // Second player joins with matching time control
        matchmakingService.joinQueue("5m", "player_2", "Player Two");

        // Verify match creation
        verify(gameRepository, times(1)).save(any(Game.class));
        verify(roomManager, times(1)).createRoom(eq(gameId), anyString(), anyString(), anyString(), anyString(), eq("5m"), eq(300000L));

        // Verify private user notifications on /queue/match
        ArgumentCaptor<String> userCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<MatchFoundEvent> eventCaptor = ArgumentCaptor.forClass(MatchFoundEvent.class);
        verify(messagingTemplate, times(2)).convertAndSendToUser(userCaptor.capture(), eq("/queue/match"), eventCaptor.capture());

        assertTrue(userCaptor.getAllValues().contains("player_1"));
        assertTrue(userCaptor.getAllValues().contains("player_2"));
    }

    @Test
    void testPlayersWithDifferentTimeControlsDoNotPair() {
        matchmakingService.joinQueue("1m", "bullet_player", "Bullet King");
        matchmakingService.joinQueue("10m", "rapid_player", "Rapid Master");

        // Different queues, no match created
        verify(gameRepository, never()).save(any(Game.class));
        verify(roomManager, never()).createRoom(any(), any(), any(), any(), any(), any(), anyLong());
    }

    @Test
    void testLeaveQueueRemovesPlayer() {
        matchmakingService.joinQueue("5m", "player_1", "Player One");
        matchmakingService.leaveQueue("player_1");

        // If player 2 joins now, player 1 has already left so no match should be formed
        matchmakingService.joinQueue("5m", "player_2", "Player Two");
        verify(gameRepository, never()).save(any(Game.class));
        verify(roomManager, never()).createRoom(any(), any(), any(), any(), any(), any(), anyLong());
    }
}
