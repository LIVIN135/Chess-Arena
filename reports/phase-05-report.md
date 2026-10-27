# Chess Arena — Phase 05 Report

## 1. Phase Information

Phase: 05
Name: Online Multiplayer
Status: Complete
Completed Date: 2026-10-03

---

## 2. What Was Implemented

- **WebSocket STOMP Infrastructure**: Configured Spring Boot WebSocket message broker with `/ws` handshake endpoint, `/topic` broadcast prefix, and `/app` application destination prefix.
- **Secure Header-Based STOMP Authentication**: Implemented `WebSocketAuthInterceptor` extracting Bearer tokens from STOMP `CONNECT` native headers (preventing token exposure in query parameters) with seamless support for guest player IDs.
- **Real-Time Matchmaking Queue**: Fast matchmaking service supporting standard chess time controls (`1m`, `3m`, `5m`, `10m`), automatically pairing players, randomly assigning colors, generating PostgreSQL `Game` sessions, and notifying matched players via `/topic/player/{playerId}/match`.
- **Active Game Room Architecture**: Server-side in-memory room management (`GameRoomManager`, `GameRoom`) enforcing turn validation, calculating clock decrements, assembling SAN moves into PGN format, and updating PostgreSQL on match conclusion.
- **Bidirectional Move Streaming & Actions**: Implemented real-time move propagation, draw offers/acceptance, resignations, and checkmate/timeout conclusions over `/topic/game/{gameId}`.
- **Frontend STOMP Client & State Management**: Integrated `@stomp/stompjs` client wrapper (`websocketService.js`) and Zustand store (`useMultiplayerStore.js`) for matchmaking search, board synchronization, clock ticking, and move validation.
- **Play Online UI**: Designed interactive online multiplayer lobby with time control selection, search radar animation, player color-oriented chessboard, dual synchronized clocks, and draw/resign actions.

---

## 3. Files Created

| File | Purpose |
|------|---------|
| `backend/src/main/java/com/chessarena/config/WebSocketConfig.java` | Spring WebSocket configuration registering `/ws` endpoint and STOMP message broker |
| `backend/src/main/java/com/chessarena/security/WebSocketAuthInterceptor.java` | STOMP ChannelInterceptor extracting and verifying JWT Bearer tokens from CONNECT headers |
| `backend/src/main/java/com/chessarena/websocket/dto/WsMoveMessage.java` | DTO representing move payloads transmitted from clients |
| `backend/src/main/java/com/chessarena/websocket/dto/WsGameEvent.java` | DTO representing broadcast game events (`MOVE_MADE`, `GAME_END`, `DRAW_OFFER`, etc.) |
| `backend/src/main/java/com/chessarena/websocket/dto/MatchFoundEvent.java` | DTO notifying players of a completed pairing and assigned colors |
| `backend/src/main/java/com/chessarena/websocket/GameRoom.java` | Active game room state tracking players, current FEN, clocks, and PGN builder |
| `backend/src/main/java/com/chessarena/websocket/GameRoomManager.java` | In-memory registry for active game rooms and room broadcasting |
| `backend/src/main/java/com/chessarena/service/MatchmakingService.java` | Concurrent matchmaking queue per time control with automatic game initialization |
| `backend/src/main/java/com/chessarena/websocket/WebSocketGameController.java` | `@MessageMapping` controller handling matchmaking, moves, draws, and resignations |
| `frontend/src/services/websocketService.js` | STOMP client service using `@stomp/stompjs` targeting `/ws` endpoint |
| `frontend/src/store/useMultiplayerStore.js` | Zustand store managing connection, matchmaking, clocks, and live game state |
| `frontend/src/components/chess/OnlineChessClock.jsx` | Real-time synchronized clock component for multiplayer |
| `frontend/src/components/chess/OnlinePromotionDialog.jsx` | Pawn promotion selection modal for online multiplayer games |
| `frontend/src/components/chess/OnlineChessBoardView.jsx` | Player color-oriented chessboard with turn enforcement and legal move highlights |
| `frontend/src/pages/PlayOnlinePage.jsx` | Main multiplayer page containing matchmaking lobby, live match view, and game-over modals |

---

## 4. Files Modified

| File | What Changed |
|------|--------------|
| `backend/pom.xml` | Added `spring-boot-starter-websocket` dependency |
| `backend/src/main/java/com/chessarena/config/SecurityConfig.java` | Permitted `/ws/**` endpoint in Spring Security filter chain |
| `frontend/vite.config.js` | Added `/ws` proxy configuration with `ws: true` for WebSocket forwarding |
| `frontend/src/components/layout/Navbar.jsx` | Added "⚔️ Play Online" navigation button and updated badge to PHASE 5 |
| `frontend/src/App.jsx` | Added routing for `PlayOnlinePage` (`currentView === 'play-online'`) |
| `frontend/src/pages/LandingPage.jsx` | Added "⚔️ Play Online Match" primary CTA button |

---

## 5. How to Run This Phase

### Backend

```bash
cd backend
mvn spring-boot:run
```

### Frontend

```bash
cd frontend
npm run dev
```

### Database

```text
PostgreSQL 18 running on port 5432 with database `chess_arena`.
Active tables: `users`, `games`, `moves`.
```

---

## 6. How to Verify

1. Start backend and frontend services.
2. Open `http://localhost:5173/` in a browser window.
3. Open a second browser window or private/incognito window at `http://localhost:5173/`.
4. In Window 1, click "⚔️ Play Online", select "Blitz 5m", and click "Find Match (5m)".
5. In Window 2, click "⚔️ Play Online", select "Blitz 5m", and click "Find Match (5m)".
6. Verify that both windows instantly receive a match found event and transition to the live match view:
   - Window 1 is assigned one color (e.g., White) and board is oriented accordingly.
   - Window 2 is assigned the opposite color (e.g., Black) and board is oriented accordingly.
7. Make move `e2 -> e4` as White in the White player window.
8. Verify the move instantly reflects on the Black player board with piece movement sound and clock switch.
9. Make a response move as Black (e.g., `e7 -> e5`) and verify instant reflection on the White board.
10. Test action controls: Offer a draw or click Resign.
11. Verify that the match concludes with the Game Over banner and results are saved in the PostgreSQL `games` table.

---

## 7. Expected Result

```text
Expected:

1. STOMP connection establishes cleanly over ws://localhost:5173/ws.
2. Matchmaking queue pairs two waiting players with the same time control.
3. Each player is randomly assigned White or Black, and a persistent Game row is created in PostgreSQL.
4. Moves played by the active turn player are transmitted via STOMP to /topic/game/{gameId} and rendered on both screens in real time.
5. Inactive players cannot move out of turn.
6. Clocks tick down on the active player's turn.
7. Resignations, checkmates, draws, and timeouts cleanly finalize the game in PostgreSQL and display game-over results.
```

---

## 8. Verification Checklist

* [x] Frontend starts
* [x] Backend starts
* [x] Database connection works
* [x] STOMP WebSocket broker active
* [x] Main feature works (matchmaking + move streaming)
* [x] API works
* [x] No console errors
* [x] No backend errors
* [x] Build succeeds (`npm run build` completed with 0 errors)

---

## 9. Errors / Bugs Found

During verification, an issue was identified where guest players without JWT tokens were assigned synthetic `guest-xxxx` server principals that initially diverged from their client payload IDs. This was resolved by adjusting `WebSocketGameController` to respect client payload IDs for unauthenticated connections while enforcing authenticated user identities for JWT holders.

---

## 10. Known Issues

```text
No known issues.
```

---

## 11. Important Configuration

```text
Backend port: 8080
Frontend port: 5173
WebSocket endpoint: ws://localhost:5173/ws (proxied to ws://localhost:8080/ws)
STOMP Application Prefix: /app
STOMP Broker Prefix: /topic
Matchmaking topics: /topic/player/{playerId}/match
Game room topics: /topic/game/{gameId}
Time controls supported: 1m, 3m, 5m, 10m
```

---

## 12. Phase Result

✅ COMPLETE

Full real-time online multiplayer with STOMP WebSockets, automated matchmaking, color orientation, dual clock synchronization, and PostgreSQL game persistence is verified and operating cleanly.
