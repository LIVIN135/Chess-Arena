package com.chessarena.service;

import com.chessarena.entity.Game;
import com.chessarena.entity.GameStatus;
import com.chessarena.repository.GameRepository;
import com.chessarena.websocket.GameRoom;
import com.chessarena.websocket.GameRoomManager;
import com.chessarena.websocket.dto.MatchFoundEvent;
import com.chessarena.websocket.dto.TimeControl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

@Service
public class MatchmakingService {

    private static final Logger log = LoggerFactory.getLogger(MatchmakingService.class);

    public static class QueuedPlayer {
        private final String playerId;
        private final String playerName;

        public QueuedPlayer(String playerId, String playerName) {
            this.playerId = playerId;
            this.playerName = playerName;
        }

        public String getPlayerId() {
            return playerId;
        }

        public String getPlayerName() {
            return playerName;
        }
    }

    private final GameRepository gameRepository;
    private final GameRoomManager roomManager;
    private final SimpMessagingTemplate messagingTemplate;

    // Strict FIFO queue per time control code
    private final Map<String, ConcurrentLinkedQueue<QueuedPlayer>> queues = new ConcurrentHashMap<>();

    public MatchmakingService(GameRepository gameRepository, GameRoomManager roomManager, SimpMessagingTemplate messagingTemplate) {
        this.gameRepository = gameRepository;
        this.roomManager = roomManager;
        this.messagingTemplate = messagingTemplate;
    }

    public synchronized void joinQueue(String rawTimeControl, String playerId, String playerName) {
        TimeControl timeControl = TimeControl.fromCode(rawTimeControl).orElse(TimeControl.FIVE_MINUTES);
        String tcCode = timeControl.getCode();

        // Remove from any existing queue first
        leaveQueue(playerId);

        ConcurrentLinkedQueue<QueuedPlayer> queue = queues.computeIfAbsent(tcCode, k -> new ConcurrentLinkedQueue<>());

        QueuedPlayer opponent = queue.poll();
        if (opponent != null) {
            log.info("Matchmaking paired: {} vs {}", opponent.getPlayerName(), playerName);

            // Match found! Randomly assign White & Black
            boolean currentIsWhite = Math.random() < 0.5;
            QueuedPlayer whitePlayer = currentIsWhite ? new QueuedPlayer(playerId, playerName) : opponent;
            QueuedPlayer blackPlayer = currentIsWhite ? opponent : new QueuedPlayer(playerId, playerName);

            // Create persistent game session in PostgreSQL
            Game game = new Game(whitePlayer.getPlayerName(), blackPlayer.getPlayerName(), "ONLINE_" + tcCode.toUpperCase(), tcCode);
            game.setStatus(GameStatus.IN_PROGRESS);
            Game savedGame = gameRepository.save(game);

            long initialTimeMs = timeControl.getDurationMs();

            // Initialize server game room
            GameRoom room = roomManager.createRoom(
                    savedGame.getId(),
                    whitePlayer.getPlayerId(),
                    blackPlayer.getPlayerId(),
                    whitePlayer.getPlayerName(),
                    blackPlayer.getPlayerName(),
                    tcCode,
                    initialTimeMs
            );

            // Send notification to both players on their private user queue (/user/queue/match)
            MatchFoundEvent eventWhite = new MatchFoundEvent(
                    savedGame.getId(),
                    "white",
                    blackPlayer.getPlayerName(),
                    tcCode,
                    room.getCurrentFen(),
                    room.getPgn(),
                    room.getWhiteTimeMs(),
                    room.getBlackTimeMs(),
                    room.getCurrentTurn()
            );

            MatchFoundEvent eventBlack = new MatchFoundEvent(
                    savedGame.getId(),
                    "black",
                    whitePlayer.getPlayerName(),
                    tcCode,
                    room.getCurrentFen(),
                    room.getPgn(),
                    room.getWhiteTimeMs(),
                    room.getBlackTimeMs(),
                    room.getCurrentTurn()
            );

            messagingTemplate.convertAndSendToUser(whitePlayer.getPlayerId(), "/queue/match", eventWhite);
            messagingTemplate.convertAndSendToUser(blackPlayer.getPlayerId(), "/queue/match", eventBlack);
        } else {
            log.info("Player {} queued for {}", playerName, tcCode);
            queue.add(new QueuedPlayer(playerId, playerName));
        }
    }

    public synchronized void leaveQueue(String playerId) {
        if (playerId == null) return;
        for (ConcurrentLinkedQueue<QueuedPlayer> queue : queues.values()) {
            queue.removeIf(p -> p.getPlayerId().equals(playerId));
        }
    }
}
