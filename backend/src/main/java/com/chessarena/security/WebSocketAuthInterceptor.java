package com.chessarena.security;

import com.chessarena.entity.User;
import com.chessarena.repository.UserRepository;
import com.chessarena.websocket.GameRoom;
import com.chessarena.websocket.GameRoomManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.lang.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

@Component
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private static final Logger log = LoggerFactory.getLogger(WebSocketAuthInterceptor.class);
    private static final Pattern GUEST_ID_PATTERN = Pattern.compile("^guest_[a-z0-9]{7}$");

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final ObjectProvider<GameRoomManager> roomManagerProvider;

    public WebSocketAuthInterceptor(
            JwtService jwtService,
            UserRepository userRepository,
            ObjectProvider<GameRoomManager> roomManagerProvider
    ) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.roomManagerProvider = roomManagerProvider;
    }

    @Override
    public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) {
            return message;
        }

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            List<String> authHeaders = accessor.getNativeHeader("Authorization");
            String authHeader = (authHeaders != null && !authHeaders.isEmpty()) ? authHeaders.get(0) : null;

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                try {
                    String username = jwtService.extractUsername(token);
                    if (username != null) {
                        Optional<User> userOptional = userRepository.findByUsername(username);
                        if (userOptional.isPresent() && jwtService.isTokenValid(token, username)) {
                            User user = userOptional.get();
                            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                                    user.getUsername(),
                                    null,
                                    Collections.singletonList(new SimpleGrantedAuthority(user.getRole().name()))
                            );
                            accessor.setUser(auth);
                            return message;
                        }
                    }
                } catch (Exception e) {
                    log.debug("Invalid JWT token on STOMP CONNECT: {}", e.getMessage());
                }
            }

            // Fallback to guest identity validated against ^guest_[a-z0-9]{7}$
            List<String> guestHeaders = accessor.getNativeHeader("guestId");
            String guestId = (guestHeaders != null && !guestHeaders.isEmpty()) ? guestHeaders.get(0) : null;

            if (guestId == null || !GUEST_ID_PATTERN.matcher(guestId).matches()) {
                guestId = "guest_" + UUID.randomUUID().toString().replace("-", "").substring(0, 7).toLowerCase();
            }

            final String finalGuestId = guestId;
            Principal guestPrincipal = () -> finalGuestId;
            accessor.setUser(guestPrincipal);
            return message;
        }

        // Phase 1.7: Reject SUBSCRIBE to /topic/game/{id} unless principal is in that room
        if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            String destination = accessor.getDestination();
            if (destination != null && destination.startsWith("/topic/game/")) {
                String idStr = destination.substring("/topic/game/".length());
                try {
                    UUID gameId = UUID.fromString(idStr);
                    GameRoomManager roomManager = roomManagerProvider.getIfAvailable();
                    if (roomManager != null) {
                        GameRoom room = roomManager.getRoom(gameId);
                        Principal principal = accessor.getUser();
                        String principalName = principal != null ? principal.getName() : null;
                        if (room != null && (principalName == null || (!room.isWhite(principalName) && !room.isBlack(principalName)))) {
                            log.warn("Unauthorized subscription attempt to room {} by principal {}", gameId, principalName);
                            return null;
                        }
                    }
                } catch (IllegalArgumentException e) {
                    return null;
                }
            }
        }

        return message;
    }
}
