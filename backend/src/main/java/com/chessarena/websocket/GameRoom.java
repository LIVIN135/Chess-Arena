package com.chessarena.websocket;

import com.github.bhlangonijr.chesslib.Board;
import com.github.bhlangonijr.chesslib.Piece;
import com.github.bhlangonijr.chesslib.Side;
import com.github.bhlangonijr.chesslib.Square;
import com.github.bhlangonijr.chesslib.move.Move;

import java.util.UUID;

public class GameRoom {
    private final UUID gameId;
    private final String whitePlayerId;
    private final String blackPlayerId;
    private final String whitePlayerName;
    private final String blackPlayerName;
    private final String timeControl;

    private final Board board;
    private String currentFen;
    private String currentTurn = "w"; // 'w' or 'b'
    private long whiteTimeMs;
    private long blackTimeMs;
    private long lastMoveTimestamp;
    private int moveNumber = 1;
    private boolean isGameOver = false;
    private final StringBuilder pgnBuilder = new StringBuilder();

    // Disconnect grace handling (30s)
    private Long whiteDisconnectedAt = null;
    private Long blackDisconnectedAt = null;

    public static class MoveResult {
        private final boolean legal;
        private final boolean gameOver;
        private final String winner;
        private final String reason;
        private final String resultTag;
        private final String fen;
        private final String turn;
        private final long whiteTimeMs;
        private final long blackTimeMs;

        public MoveResult(boolean legal, boolean gameOver, String winner, String reason, String resultTag,
                          String fen, String turn, long whiteTimeMs, long blackTimeMs) {
            this.legal = legal;
            this.gameOver = gameOver;
            this.winner = winner;
            this.reason = reason;
            this.resultTag = resultTag;
            this.fen = fen;
            this.turn = turn;
            this.whiteTimeMs = whiteTimeMs;
            this.blackTimeMs = blackTimeMs;
        }

        public static MoveResult illegal() {
            return new MoveResult(false, false, null, null, null, null, null, 0, 0);
        }

        public boolean isLegal() { return legal; }
        public boolean isGameOver() { return gameOver; }
        public String getWinner() { return winner; }
        public String getReason() { return reason; }
        public String getResultTag() { return resultTag; }
        public String getFen() { return fen; }
        public String getTurn() { return turn; }
        public long getWhiteTimeMs() { return whiteTimeMs; }
        public long getBlackTimeMs() { return blackTimeMs; }
    }

    public GameRoom(UUID gameId, String whitePlayerId, String blackPlayerId, String whitePlayerName, String blackPlayerName, String timeControl, long initialTimeMs) {
        this.gameId = gameId;
        this.whitePlayerId = whitePlayerId;
        this.blackPlayerId = blackPlayerId;
        this.whitePlayerName = whitePlayerName;
        this.blackPlayerName = blackPlayerName;
        this.timeControl = timeControl;
        this.board = new Board();
        this.currentFen = this.board.getFen();
        this.whiteTimeMs = initialTimeMs;
        this.blackTimeMs = initialTimeMs;
        this.lastMoveTimestamp = System.currentTimeMillis();

        pgnBuilder.append(String.format("[Event \"Chess Arena Online\"]\n[White \"%s\"]\n[Black \"%s\"]\n\n", whitePlayerName, blackPlayerName));
    }

    public synchronized MoveResult makeMove(String from, String to, String promotion, String san) {
        if (isGameOver) {
            return MoveResult.illegal();
        }

        try {
            Square fromSq = Square.fromValue(from.toUpperCase());
            Square toSq = Square.fromValue(to.toUpperCase());

            Piece promoPiece = Piece.NONE;
            if (promotion != null && !promotion.isEmpty()) {
                boolean isWhite = (board.getSideToMove() == Side.WHITE);
                char p = Character.toLowerCase(promotion.charAt(0));
                switch (p) {
                    case 'r' -> promoPiece = isWhite ? Piece.WHITE_ROOK : Piece.BLACK_ROOK;
                    case 'b' -> promoPiece = isWhite ? Piece.WHITE_BISHOP : Piece.BLACK_BISHOP;
                    case 'n' -> promoPiece = isWhite ? Piece.WHITE_KNIGHT : Piece.BLACK_KNIGHT;
                    default -> promoPiece = isWhite ? Piece.WHITE_QUEEN : Piece.BLACK_QUEEN;
                }
            }

            Move candidateMove = (promoPiece != Piece.NONE)
                    ? new Move(fromSq, toSq, promoPiece)
                    : new Move(fromSq, toSq);

            if (!board.legalMoves().contains(candidateMove)) {
                return MoveResult.illegal();
            }

            // Apply move
            board.doMove(candidateMove);

            long now = System.currentTimeMillis();
            long elapsed = now - lastMoveTimestamp;
            this.lastMoveTimestamp = now;

            String movedTurn = this.currentTurn;
            if ("w".equals(movedTurn)) {
                whiteTimeMs = Math.max(0, whiteTimeMs - elapsed);
                pgnBuilder.append(moveNumber).append(". ").append(san != null ? san : candidateMove.toString()).append(" ");
            } else {
                blackTimeMs = Math.max(0, blackTimeMs - elapsed);
                pgnBuilder.append(san != null ? san : candidateMove.toString()).append(" ");
                moveNumber++;
            }

            this.currentFen = board.getFen();
            this.currentTurn = (board.getSideToMove() == Side.WHITE) ? "w" : "b";

            // Check game termination conditions via chesslib
            boolean over = false;
            String winner = null;
            String reason = null;
            String resultTag = null;

            if (board.isMated()) {
                over = true;
                if ("w".equals(movedTurn)) {
                    winner = "White";
                    reason = "Checkmate";
                    resultTag = "1-0";
                } else {
                    winner = "Black";
                    reason = "Checkmate";
                    resultTag = "0-1";
                }
            } else if (board.isStaleMate()) {
                over = true;
                winner = "Draw";
                reason = "Stalemate";
                resultTag = "1/2-1/2";
            } else if (board.isDraw()) {
                over = true;
                winner = "Draw";
                reason = "Draw by Rule";
                resultTag = "1/2-1/2";
            }

            if (over) {
                isGameOver = true;
                pgnBuilder.append(resultTag);
            }

            return new MoveResult(true, over, winner, reason, resultTag, currentFen, currentTurn, whiteTimeMs, blackTimeMs);
        } catch (Exception e) {
            return MoveResult.illegal();
        }
    }

    public synchronized void updateClocksOnTick() {
        if (isGameOver) return;
        long now = System.currentTimeMillis();
        long elapsed = now - lastMoveTimestamp;
        this.lastMoveTimestamp = now;

        if ("w".equals(currentTurn)) {
            whiteTimeMs = Math.max(0, whiteTimeMs - elapsed);
        } else {
            blackTimeMs = Math.max(0, blackTimeMs - elapsed);
        }
    }

    public synchronized boolean finishGame(String winner, String reason, String resultTag) {
        if (isGameOver) {
            return false;
        }
        this.isGameOver = true;
        if (resultTag != null && !resultTag.isEmpty()) {
            this.pgnBuilder.append(resultTag);
        }
        return true;
    }

    public synchronized void recordDisconnect(String playerId) {
        if (isWhite(playerId)) {
            this.whiteDisconnectedAt = System.currentTimeMillis();
        } else if (isBlack(playerId)) {
            this.blackDisconnectedAt = System.currentTimeMillis();
        }
    }

    public synchronized void recordReconnect(String playerId) {
        if (isWhite(playerId)) {
            this.whiteDisconnectedAt = null;
        } else if (isBlack(playerId)) {
            this.blackDisconnectedAt = null;
        }
    }

    public synchronized Long getWhiteDisconnectedAt() {
        return whiteDisconnectedAt;
    }

    public synchronized Long getBlackDisconnectedAt() {
        return blackDisconnectedAt;
    }

    public boolean isWhite(String playerId) {
        return whitePlayerId != null && whitePlayerId.equals(playerId);
    }

    public boolean isBlack(String playerId) {
        return blackPlayerId != null && blackPlayerId.equals(playerId);
    }

    public UUID getGameId() {
        return gameId;
    }

    public String getWhitePlayerId() {
        return whitePlayerId;
    }

    public String getBlackPlayerId() {
        return blackPlayerId;
    }

    public String getWhitePlayerName() {
        return whitePlayerName;
    }

    public String getBlackPlayerName() {
        return blackPlayerName;
    }

    public String getTimeControl() {
        return timeControl;
    }

    public synchronized String getCurrentFen() {
        return currentFen;
    }

    public synchronized void setCurrentFen(String currentFen) {
        this.currentFen = currentFen;
    }

    public synchronized String getCurrentTurn() {
        return currentTurn;
    }

    public synchronized long getWhiteTimeMs() {
        return whiteTimeMs;
    }

    public synchronized long getBlackTimeMs() {
        return blackTimeMs;
    }

    public synchronized int getMoveNumber() {
        return moveNumber;
    }

    public synchronized boolean isGameOver() {
        return isGameOver;
    }

    public synchronized void setGameOver(boolean gameOver) {
        this.isGameOver = gameOver;
    }

    public synchronized String getPgn() {
        return pgnBuilder.toString();
    }
}
