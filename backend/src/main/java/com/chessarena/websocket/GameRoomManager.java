package com.chessarena.websocket;

import com.chessarena.entity.Game;
import com.chessarena.entity.GameResult;
import com.chessarena.entity.GameStatus;
import com.chessarena.repository.GameRepository;
import com.chessarena.websocket.dto.WsGameEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Component
public class GameRoomManager {

    private static final Logger log = LoggerFactory.getLogger(GameRoomManager.class);

    private final SimpMessagingTemplate messagingTemplate;
    private final GameRepository gameRepository;
    private final ConcurrentMap<UUID, GameRoom> activeRooms = new ConcurrentHashMap<>();

    public GameRoomManager(SimpMessagingTemplate messagingTemplate, GameRepository gameRepository) {
        this.messagingTemplate = messagingTemplate;
        this.gameRepository = gameRepository;
    }

    public GameRoom createRoom(UUID gameId, String whiteId, String blackId, String whiteName, String blackName, String timeControl, long initialTimeMs) {
        GameRoom room = new GameRoom(gameId, whiteId, blackId, whiteName, blackName, timeControl, initialTimeMs);
        activeRooms.put(gameId, room);
        return room;
    }

    public GameRoom getRoom(UUID gameId) {
        return activeRooms.get(gameId);
    }

    public void removeRoom(UUID gameId) {
        activeRooms.remove(gameId);
    }

    public Optional<GameRoom> findActiveRoomByPlayer(String playerId) {
        if (playerId == null) return Optional.empty();
        return activeRooms.values().stream()
                .filter(room -> !room.isGameOver() && (room.isWhite(playerId) || room.isBlack(playerId)))
                .findFirst();
    }

    public void broadcastToRoom(UUID gameId, WsGameEvent event) {
        messagingTemplate.convertAndSend("/topic/game/" + gameId, event);
    }

    public void sendToUser(String usernameOrSessionId, String destination, Object payload) {
        messagingTemplate.convertAndSendToUser(usernameOrSessionId, destination, payload);
    }

    public synchronized void finishGame(GameRoom room, String winner, String reason, String resultTag) {
        if (room == null) return;
        boolean finished = room.finishGame(winner, reason, resultTag);
        if (!finished) {
            return; // Idempotent: already finished
        }

        UUID gameId = room.getGameId();
        log.info("Finishing game {}: winner={}, reason={}", gameId, winner, reason);

        // Update database record
        try {
            gameRepository.findById(gameId).ifPresent(game -> {
                if ("White".equalsIgnoreCase(winner)) {
                    game.setResult(GameResult.WHITE_WINS);
                } else if ("Black".equalsIgnoreCase(winner)) {
                    game.setResult(GameResult.BLACK_WINS);
                } else {
                    game.setResult(GameResult.DRAW);
                }
                game.setTerminationReason(reason);
                game.setFinalFen(room.getCurrentFen());
                game.setPgn(room.getPgn());
                game.setStatus(GameStatus.COMPLETED);
                game.setEndTime(Instant.now());
                gameRepository.save(game);
            });
        } catch (Exception e) {
            log.error("Failed to update game status in DB for {}: {}", gameId, e.getMessage());
        }

        WsGameEvent event = WsGameEvent.gameEnd(gameId, winner, reason, room.getCurrentFen(), room.getPgn());
        broadcastToRoom(gameId, event);
        removeRoom(gameId);
    }

    public void handlePlayerDisconnect(String playerId) {
        if (playerId == null) return;
        findActiveRoomByPlayer(playerId).ifPresent(room -> {
            log.info("Player {} disconnected from live room {}. Grace timer started.", playerId, room.getGameId());
            room.recordDisconnect(playerId);
        });
    }

    public void handlePlayerReconnect(String playerId) {
        if (playerId == null) return;
        findActiveRoomByPlayer(playerId).ifPresent(room -> {
            log.info("Player {} reconnected to live room {}.", playerId, room.getGameId());
            room.recordReconnect(playerId);
        });
    }

    @Scheduled(fixedDelay = 1000)
    public void tickAndCheckTimeouts() {
        if (activeRooms.isEmpty()) return;

        long now = System.currentTimeMillis();
        for (GameRoom room : activeRooms.values()) {
            if (room.isGameOver()) continue;

            room.updateClocksOnTick();

            // 1. Check time out
            if (room.getWhiteTimeMs() <= 0) {
                finishGame(room, "Black", "White Timed Out", "0-1");
                continue;
            } else if (room.getBlackTimeMs() <= 0) {
                finishGame(room, "White", "Black Timed Out", "1-0");
                continue;
            }

            // 2. Check 30s disconnect abandonment
            Long whiteDisc = room.getWhiteDisconnectedAt();
            if (whiteDisc != null && (now - whiteDisc > 30_000)) {
                finishGame(room, "Black", "White Abandoned", "0-1");
                continue;
            }

            Long blackDisc = room.getBlackDisconnectedAt();
            if (blackDisc != null && (now - blackDisc > 30_000)) {
                finishGame(room, "White", "Black Abandoned", "1-0");
            }
        }
    }
}
