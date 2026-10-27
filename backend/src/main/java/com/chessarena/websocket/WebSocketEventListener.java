package com.chessarena.websocket;

import com.chessarena.service.MatchmakingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;

@Component
public class WebSocketEventListener {

    private static final Logger log = LoggerFactory.getLogger(WebSocketEventListener.class);

    private final MatchmakingService matchmakingService;
    private final GameRoomManager roomManager;

    public WebSocketEventListener(MatchmakingService matchmakingService, GameRoomManager roomManager) {
        this.matchmakingService = matchmakingService;
        this.roomManager = roomManager;
    }

    @EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) {
        Principal user = event.getUser();
        if (user != null) {
            String playerId = user.getName();
            log.debug("WebSocket session disconnect for player: {}", playerId);
            matchmakingService.leaveQueue(playerId);
            roomManager.handlePlayerDisconnect(playerId);
        }
    }

    @EventListener
    public void handleSessionConnected(SessionConnectedEvent event) {
        Principal user = event.getUser();
        if (user != null) {
            String playerId = user.getName();
            log.debug("WebSocket session connected for player: {}", playerId);
            roomManager.handlePlayerReconnect(playerId);
        }
    }
}
