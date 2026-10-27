package com.chessarena;

import com.chessarena.websocket.GameRoom;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class GameRoomTest {

    private GameRoom room;
    private final UUID gameId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        room = new GameRoom(gameId, "alice", "bob", "Alice", "Bob", "5m", 300000L);
    }

    @Test
    void testInitialState() {
        assertEquals("w", room.getCurrentTurn());
        assertFalse(room.isGameOver());
        assertTrue(room.isWhite("alice"));
        assertTrue(room.isBlack("bob"));
        assertFalse(room.isWhite("bob"));
        assertFalse(room.isBlack("charlie"));
        assertEquals(300000L, room.getWhiteTimeMs());
        assertEquals(300000L, room.getBlackTimeMs());
    }

    @Test
    void testLegalMoveSucceeds() {
        GameRoom.MoveResult result = room.makeMove("e2", "e4", null, "e4");
        assertTrue(result.isLegal());
        assertFalse(result.isGameOver());
        assertEquals("b", room.getCurrentTurn());
        assertEquals("b", result.getTurn());
        assertTrue(result.getFen().contains("4P3"));
    }

    @Test
    void testIllegalMoveFails() {
        // Pawn cannot jump 3 squares
        GameRoom.MoveResult result = room.makeMove("e2", "e5", null, "e5");
        assertFalse(result.isLegal());
        assertEquals("w", room.getCurrentTurn());
    }

    @Test
    void testTurnAlternation() {
        // 1. e4
        GameRoom.MoveResult r1 = room.makeMove("e2", "e4", null, "e4");
        assertTrue(r1.isLegal());
        assertEquals("b", room.getCurrentTurn());

        // White tries to move again on Black's turn (e.g. d2 d4) -> illegal in chesslib
        GameRoom.MoveResult rIllegal = room.makeMove("d2", "d4", null, "d4");
        assertFalse(rIllegal.isLegal());

        // Black moves e7 e5
        GameRoom.MoveResult r2 = room.makeMove("e7", "e5", null, "e5");
        assertTrue(r2.isLegal());
        assertEquals("w", room.getCurrentTurn());
    }

    @Test
    void testFoolsMateCheckmateDetection() {
        // Fool's Mate: 1. f3 e5 2. g4 Qh4# (0-1)
        assertTrue(room.makeMove("f2", "f3", null, "f3").isLegal());
        assertTrue(room.makeMove("e7", "e5", null, "e5").isLegal());
        assertTrue(room.makeMove("g2", "g4", null, "g4").isLegal());

        GameRoom.MoveResult mateResult = room.makeMove("d8", "h4", null, "Qh4#");
        assertTrue(mateResult.isLegal());
        assertTrue(mateResult.isGameOver());
        assertEquals("Black", mateResult.getWinner());
        assertEquals("Checkmate", mateResult.getReason());
        assertEquals("0-1", mateResult.getResultTag());
        assertTrue(room.isGameOver());
    }

    @Test
    void testClockDecrementOnTick() {
        GameRoom fastRoom = new GameRoom(UUID.randomUUID(), "alice", "bob", "Alice", "Bob", "1m", 5000L);
        try {
            Thread.sleep(60L);
        } catch (InterruptedException ignored) {}

        fastRoom.updateClocksOnTick();
        assertTrue(fastRoom.getWhiteTimeMs() < 5000L);
        assertEquals(5000L, fastRoom.getBlackTimeMs()); // Black hasn't had a turn yet
    }

    @Test
    void testFinishGameIdempotent() {
        assertTrue(room.finishGame("White", "Resignation", "1-0"));
        assertTrue(room.isGameOver());
        // Second call should return false
        assertFalse(room.finishGame("White", "Resignation", "1-0"));
    }
}
