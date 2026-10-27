package com.chessarena;

import com.github.bhlangonijr.chesslib.Board;
import com.github.bhlangonijr.chesslib.Square;
import com.github.bhlangonijr.chesslib.move.Move;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class ChesslibTest {

    @Test
    void testChesslibBasics() {
        Board board = new Board();
        Move move = new Move(Square.fromValue("E2"), Square.fromValue("E4"));
        assertTrue(board.legalMoves().contains(move));
        board.doMove(move);
        assertEquals("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1", board.getFen());
        assertFalse(board.isMated());
        assertFalse(board.isDraw());

        // Test pawn promotion
        Board promoBoard = new Board();
        promoBoard.loadFromFen("4k3/4P3/8/8/8/8/8/4K3 w - - 0 1");
        System.out.println("LEGAL MOVES: " + promoBoard.legalMoves());
        for (Move m : promoBoard.legalMoves()) {
            System.out.println("Move: " + m + " from=" + m.getFrom() + " to=" + m.getTo() + " promo=" + m.getPromotion());
        }
        Move promoMove = new Move(Square.fromValue("E7"), Square.fromValue("E8"), com.github.bhlangonijr.chesslib.Piece.WHITE_QUEEN);
        System.out.println("PromoMove: " + promoMove + " from=" + promoMove.getFrom() + " to=" + promoMove.getTo() + " promo=" + promoMove.getPromotion());
        promoBoard.doMove(promoMove);
        assertTrue(promoBoard.getFen().startsWith("4Q3/8/4k3") || promoBoard.getFen().contains("4Q3"));
    }
}
