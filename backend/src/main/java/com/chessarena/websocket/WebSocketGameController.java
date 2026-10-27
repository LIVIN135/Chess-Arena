package com.chessarena.websocket;

import com.chessarena.service.MatchmakingService;
import com.chessarena.websocket.dto.TimeControl;
import com.chessarena.websocket.dto.WsGameEvent;
import com.chessarena.websocket.dto.WsMoveMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;

@Controller
public class WebSocketGameController {

    private static final Logger log = LoggerFactory.getLogger(WebSocketGameController.class);

    private final GameRoomManager roomManager;
    private final MatchmakingService matchmakingService;
    private final com.chessarena.security.RateLimitingService rateLimitingService;

    public WebSocketGameController(GameRoomManager roomManager,
                                   MatchmakingService matchmakingService,
                                   com.chessarena.security.RateLimitingService rateLimitingService) {
        this.roomManager = roomManager;
        this.matchmakingService = matchmakingService;
        this.rateLimitingService = rateLimitingService;
    }

    @MessageMapping("/matchmaking/join")
    public void joinMatchmaking(@Payload Map<String, String> payload, Principal principal) {
        if (principal == null) {
            log.warn("Unauthorized joinMatchmaking request without principal");
            return;
        }

        String playerId = principal.getName();
        if (!rateLimitingService.tryConsumeMatchmaking(playerId)) {
            log.warn("Matchmaking rate limit exceeded for player {}", playerId);
            return;
        }

        String playerName = payload.getOrDefault("playerName", playerId);
        String rawTc = payload.getOrDefault("timeControl", "5m");

        // Validate time control against allow-list
        if (!TimeControl.isValid(rawTc)) {
            log.warn("Invalid timeControl '{}' from player {}, defaulting to 5m", rawTc, playerId);
            rawTc = "5m";
        }

        matchmakingService.joinQueue(rawTc, playerId, playerName);
    }

    @MessageMapping("/matchmaking/leave")
    public void leaveMatchmaking(Principal principal) {
        if (principal == null) {
            return;
        }
        matchmakingService.leaveQueue(principal.getName());
    }

    @MessageMapping("/game/{gameId}/move")
    public void handleMove(
            @DestinationVariable("gameId") UUID gameId,
            @Payload WsMoveMessage moveMessage,
            Principal principal
    ) {
        if (principal == null) {
            log.warn("Anonymous move attempted for room {}", gameId);
            return;
        }

        GameRoom room = roomManager.getRoom(gameId);
        if (room == null || room.isGameOver()) return;

        String senderId = principal.getName();
        boolean isWhite = room.isWhite(senderId);
        boolean isBlack = room.isBlack(senderId);

        // Reject if principal is neither white nor black
        if (!isWhite && !isBlack) {
            log.warn("Principal {} is not a participant in game {}", senderId, gameId);
            return;
        }

        String currentTurn = room.getCurrentTurn(); // 'w' or 'b'
        if ((isWhite && !"w".equals(currentTurn)) || (isBlack && !"b".equals(currentTurn))) {
            log.debug("Move rejected for {}: not player turn", senderId);
            return;
        }

        // Validate legality server-side using chesslib
        GameRoom.MoveResult result = room.makeMove(
                moveMessage.getFrom(),
                moveMessage.getTo(),
                moveMessage.getPromotion(),
                moveMessage.getSan()
        );

        if (!result.isLegal()) {
            log.warn("Illegal move attempted in game {}: {}->{}", gameId, moveMessage.getFrom(), moveMessage.getTo());
            return;
        }

        if (result.isGameOver()) {
            // Checkmate or stalemate or rule draw
            roomManager.finishGame(room, result.getWinner(), result.getReason(), result.getResultTag());
        } else {
            WsGameEvent event = WsGameEvent.moveMade(
                    gameId,
                    result.getFen(),
                    moveMessage.getSan(),
                    moveMessage.getFrom(),
                    moveMessage.getTo(),
                    result.getTurn(),
                    result.getWhiteTimeMs(),
                    result.getBlackTimeMs()
            );
            roomManager.broadcastToRoom(gameId, event);
        }
    }

    @MessageMapping("/game/{gameId}/resign")
    public void handleResign(
            @DestinationVariable("gameId") UUID gameId,
            Principal principal
    ) {
        if (principal == null) return;
        GameRoom room = roomManager.getRoom(gameId);
        if (room == null || room.isGameOver()) return;

        String senderId = principal.getName();
        boolean isWhite = room.isWhite(senderId);
        boolean isBlack = room.isBlack(senderId);

        if (!isWhite && !isBlack) {
            log.warn("Non-participant {} attempted resign in game {}", senderId, gameId);
            return;
        }

        String winner = isWhite ? "Black" : "White";
        String reason = (isWhite ? "White" : "Black") + " Resigned";
        String resultTag = isWhite ? "0-1" : "1-0";

        roomManager.finishGame(room, winner, reason, resultTag);
    }

    @MessageMapping("/game/{gameId}/draw-offer")
    public void handleDrawOffer(
            @DestinationVariable("gameId") UUID gameId,
            Principal principal
    ) {
        if (principal == null) return;
        GameRoom room = roomManager.getRoom(gameId);
        if (room == null || room.isGameOver()) return;

        String senderId = principal.getName();
        if (!room.isWhite(senderId) && !room.isBlack(senderId)) return;

        String fromColor = room.isWhite(senderId) ? "white" : "black";
        WsGameEvent event = WsGameEvent.drawOffer(gameId, fromColor);
        roomManager.broadcastToRoom(gameId, event);
    }

    @MessageMapping("/game/{gameId}/draw-accept")
    public void handleDrawAccept(
            @DestinationVariable("gameId") UUID gameId,
            Principal principal
    ) {
        if (principal == null) return;
        GameRoom room = roomManager.getRoom(gameId);
        if (room == null || room.isGameOver()) return;

        String senderId = principal.getName();
        if (!room.isWhite(senderId) && !room.isBlack(senderId)) return;

        roomManager.finishGame(room, "Draw", "Draw Agreed", "1/2-1/2");
    }

    @MessageMapping("/game/{gameId}/draw-decline")
    public void handleDrawDecline(
            @DestinationVariable("gameId") UUID gameId,
            Principal principal
    ) {
        if (principal == null) return;
        GameRoom room = roomManager.getRoom(gameId);
        if (room == null || room.isGameOver()) return;

        String senderId = principal.getName();
        if (!room.isWhite(senderId) && !room.isBlack(senderId)) return;

        String fromColor = room.isWhite(senderId) ? "white" : "black";
        WsGameEvent event = WsGameEvent.drawDeclined(gameId, fromColor);
        roomManager.broadcastToRoom(gameId, event);
    }
}
