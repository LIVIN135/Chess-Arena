package com.chessarena.service;

import com.chessarena.dto.response.AiMoveResponse;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AiChessService {

    // Piece values in centipawns
    private static final int PAWN_VAL = 100;
    private static final int KNIGHT_VAL = 320;
    private static final int BISHOP_VAL = 330;
    private static final int ROOK_VAL = 500;
    private static final int QUEEN_VAL = 900;
    private static final int KING_VAL = 20000;

    // Piece-Square Tables (from White's perspective, rank 8 down to rank 1)
    private static final int[] PAWN_PST = {
            0,  0,  0,  0,  0,  0,  0,  0,
            50, 50, 50, 50, 50, 50, 50, 50,
            10, 10, 20, 30, 30, 20, 10, 10,
            5,  5, 10, 25, 25, 10,  5,  5,
            0,  0,  0, 20, 20,  0,  0,  0,
            5, -5,-10,  0,  0,-10, -5,  5,
            5, 10, 10,-20,-20, 10, 10,  5,
            0,  0,  0,  0,  0,  0,  0,  0
    };

    private static final int[] KNIGHT_PST = {
            -50,-40,-30,-30,-30,-30,-40,-50,
            -40,-20,  0,  0,  0,  0,-20,-40,
            -30,  0, 10, 15, 15, 10,  0,-30,
            -30,  5, 15, 20, 20, 15,  5,-30,
            -30,  0, 15, 20, 20, 15,  0,-30,
            -30,  5, 10, 15, 15, 10,  5,-30,
            -40,-20,  0,  5,  5,  0,-20,-40,
            -50,-40,-30,-30,-30,-30,-40,-50
    };

    private static final int[] BISHOP_PST = {
            -20,-10,-10,-10,-10,-10,-10,-20,
            -10,  0,  0,  0,  0,  0,  0,-10,
            -10,  0,  5, 10, 10,  5,  0,-10,
            -10,  5,  5, 10, 10,  5,  5,-10,
            -10,  0, 10, 10, 10, 10,  0,-10,
            -10, 10, 10, 10, 10, 10, 10,-10,
            -10,  5,  0,  0,  0,  0,  5,-10,
            -20,-10,-10,-10,-10,-10,-10,-20
    };

    private static final int[] ROOK_PST = {
            0,  0,  0,  0,  0,  0,  0,  0,
            5, 10, 10, 10, 10, 10, 10,  5,
            -5,  0,  0,  0,  0,  0,  0, -5,
            -5,  0,  0,  0,  0,  0,  0, -5,
            -5,  0,  0,  0,  0,  0,  0, -5,
            -5,  0,  0,  0,  0,  0,  0, -5,
            -5,  0,  0,  0,  0,  0,  0, -5,
            0,  0,  0,  5,  5,  0,  0,  0
    };

    private static final int[] QUEEN_PST = {
            -20,-10,-10, -5, -5,-10,-10,-20,
            -10,  0,  0,  0,  0,  0,  0,-10,
            -10,  0,  5,  5,  5,  5,  0,-10,
            -5,  0,  5,  5,  5,  5,  0, -5,
            0,  0,  5,  5,  5,  5,  0, -5,
            -10,  5,  5,  5,  5,  5,  0,-10,
            -10,  0,  5,  0,  0,  0,  0,-10,
            -20,-10,-10, -5, -5,-10,-10,-20
    };

    private static final int[] KING_MIDDLE_PST = {
            -30,-40,-40,-50,-50,-40,-40,-30,
            -30,-40,-40,-50,-50,-40,-40,-30,
            -30,-40,-40,-50,-50,-40,-40,-30,
            -30,-40,-40,-50,-50,-40,-40,-30,
            -20,-30,-30,-40,-40,-30,-30,-20,
            -10,-20,-20,-20,-20,-20,-20,-10,
            20, 20,  0,  0,  0,  0, 20, 20,
            20, 30, 10,  0,  0, 10, 30, 20
    };

    public static class Move {
        public int from; // 0 to 63
        public int to;   // 0 to 63
        public char piece;
        public char captured;
        public char promotion;
        public int score;

        public Move(int from, int to, char piece, char captured, char promotion) {
            this.from = from;
            this.to = to;
            this.piece = piece;
            this.captured = captured;
            this.promotion = promotion;
        }

        public String getFromCoord() {
            int file = from % 8;
            int rank = 8 - (from / 8);
            return "" + (char) ('a' + file) + rank;
        }

        public String getToCoord() {
            int file = to % 8;
            int rank = 8 - (to / 8);
            return "" + (char) ('a' + file) + rank;
        }
    }

    public AiMoveResponse computeBestMove(String fen, String difficultyStr) {
        String difficulty = difficultyStr != null ? difficultyStr.toUpperCase() : "INTERMEDIATE";
        char[] board = parseFen(fen);
        boolean isWhiteTurn = isWhiteTurn(fen);

        List<Move> legalMoves = generateLegalMoves(board, isWhiteTurn);
        if (legalMoves.isEmpty()) {
            return new AiMoveResponse(null, null, null, null, 0.0, 0, difficulty);
        }

        int depth;
        double blunderChance;

        switch (difficulty) {
            case "NOVICE":
                depth = 1;
                blunderChance = 0.35;
                break;
            case "INTERMEDIATE":
                depth = 2;
                blunderChance = 0.10;
                break;
            case "ADVANCED":
                depth = 3;
                blunderChance = 0.02;
                break;
            case "MASTER":
            default:
                depth = 4;
                blunderChance = 0.0;
                break;
        }

        // Random move if novice blunder triggered
        if (Math.random() < blunderChance && legalMoves.size() > 1) {
            Move randomMove = legalMoves.get(new Random().nextInt(legalMoves.size()));
            String san = formatSan(randomMove, board, legalMoves);
            return new AiMoveResponse(
                    randomMove.getFromCoord(),
                    randomMove.getToCoord(),
                    randomMove.promotion != ' ' ? String.valueOf(Character.toLowerCase(randomMove.promotion)) : null,
                    san,
                    0.0,
                    depth,
                    difficulty
            );
        }

        // Minimax with Alpha-Beta
        Move bestMove = null;
        int bestVal = isWhiteTurn ? Integer.MIN_VALUE : Integer.MAX_VALUE;
        int alpha = Integer.MIN_VALUE;
        int beta = Integer.MAX_VALUE;

        // Move ordering: evaluate captures first
        legalMoves.sort((a, b) -> Integer.compare(getMoveOrderScore(b), getMoveOrderScore(a)));

        for (Move move : legalMoves) {
            makeMove(board, move);
            int val = minimax(board, depth - 1, alpha, beta, !isWhiteTurn);
            unmakeMove(board, move);

            if (isWhiteTurn) {
                if (val > bestVal) {
                    bestVal = val;
                    bestMove = move;
                }
                alpha = Math.max(alpha, bestVal);
            } else {
                if (val < bestVal) {
                    bestVal = val;
                    bestMove = move;
                }
                beta = Math.min(beta, bestVal);
            }

            if (beta <= alpha) {
                break;
            }
        }

        if (bestMove == null) {
            bestMove = legalMoves.get(0);
        }

        String san = formatSan(bestMove, board, legalMoves);
        double evaluationPawnUnits = bestVal / 100.0;

        return new AiMoveResponse(
                bestMove.getFromCoord(),
                bestMove.getToCoord(),
                bestMove.promotion != ' ' ? String.valueOf(Character.toLowerCase(bestMove.promotion)) : null,
                san,
                evaluationPawnUnits,
                depth,
                difficulty
        );
    }

    private int minimax(char[] board, int depth, int alpha, int beta, boolean isWhiteTurn) {
        if (depth == 0) {
            return evaluateBoard(board);
        }

        List<Move> moves = generateLegalMoves(board, isWhiteTurn);
        if (moves.isEmpty()) {
            if (isKingInCheck(board, isWhiteTurn)) {
                return isWhiteTurn ? -30000 + (10 - depth) : 30000 - (10 - depth); // checkmate
            }
            return 0; // stalemate
        }

        moves.sort((a, b) -> Integer.compare(getMoveOrderScore(b), getMoveOrderScore(a)));

        if (isWhiteTurn) {
            int maxEval = Integer.MIN_VALUE;
            for (Move move : moves) {
                makeMove(board, move);
                int eval = minimax(board, depth - 1, alpha, beta, false);
                unmakeMove(board, move);
                maxEval = Math.max(maxEval, eval);
                alpha = Math.max(alpha, eval);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            int minEval = Integer.MAX_VALUE;
            for (Move move : moves) {
                makeMove(board, move);
                int eval = minimax(board, depth - 1, alpha, beta, true);
                unmakeMove(board, move);
                minEval = Math.min(minEval, eval);
                beta = Math.min(beta, eval);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }

    private int evaluateBoard(char[] board) {
        int whiteScore = 0;
        int blackScore = 0;

        for (int i = 0; i < 64; i++) {
            char p = board[i];
            if (p == '.') continue;

            int pstIndexWhite = i;
            int pstIndexBlack = ((7 - (i / 8)) * 8) + (i % 8);

            switch (p) {
                case 'P':
                    whiteScore += PAWN_VAL + PAWN_PST[pstIndexWhite];
                    break;
                case 'N':
                    whiteScore += KNIGHT_VAL + KNIGHT_PST[pstIndexWhite];
                    break;
                case 'B':
                    whiteScore += BISHOP_VAL + BISHOP_PST[pstIndexWhite];
                    break;
                case 'R':
                    whiteScore += ROOK_VAL + ROOK_PST[pstIndexWhite];
                    break;
                case 'Q':
                    whiteScore += QUEEN_VAL + QUEEN_PST[pstIndexWhite];
                    break;
                case 'K':
                    whiteScore += KING_VAL + KING_MIDDLE_PST[pstIndexWhite];
                    break;
                case 'p':
                    blackScore += PAWN_VAL + PAWN_PST[pstIndexBlack];
                    break;
                case 'n':
                    blackScore += KNIGHT_VAL + KNIGHT_PST[pstIndexBlack];
                    break;
                case 'b':
                    blackScore += BISHOP_VAL + BISHOP_PST[pstIndexBlack];
                    break;
                case 'r':
                    blackScore += ROOK_VAL + ROOK_PST[pstIndexBlack];
                    break;
                case 'q':
                    blackScore += QUEEN_VAL + QUEEN_PST[pstIndexBlack];
                    break;
                case 'k':
                    blackScore += KING_VAL + KING_MIDDLE_PST[pstIndexBlack];
                    break;
            }
        }

        return whiteScore - blackScore;
    }

    private int getMoveOrderScore(Move move) {
        if (move.captured != '.') {
            return 10 * getPieceBaseValue(move.captured) - getPieceBaseValue(move.piece);
        }
        if (move.promotion != ' ') {
            return 800;
        }
        return 0;
    }

    private int getPieceBaseValue(char piece) {
        char p = Character.toUpperCase(piece);
        return switch (p) {
            case 'P' -> PAWN_VAL;
            case 'N' -> KNIGHT_VAL;
            case 'B' -> BISHOP_VAL;
            case 'R' -> ROOK_VAL;
            case 'Q' -> QUEEN_VAL;
            case 'K' -> KING_VAL;
            default -> 0;
        };
    }

    private void makeMove(char[] board, Move move) {
        board[move.to] = (move.promotion != ' ') ? move.promotion : move.piece;
        board[move.from] = '.';
    }

    private void unmakeMove(char[] board, Move move) {
        board[move.from] = move.piece;
        board[move.to] = move.captured;
    }

    private boolean isWhiteTurn(String fen) {
        String[] parts = fen.split(" ");
        return parts.length < 2 || "w".equals(parts[1]);
    }

    private char[] parseFen(String fen) {
        char[] board = new char[64];
        Arrays.fill(board, '.');

        String pieces = fen.split(" ")[0];
        int row = 0;
        int col = 0;

        for (char c : pieces.toCharArray()) {
            if (c == '/') {
                row++;
                col = 0;
            } else if (Character.isDigit(c)) {
                col += (c - '0');
            } else {
                board[row * 8 + col] = c;
                col++;
            }
        }

        return board;
    }

    private List<Move> generateLegalMoves(char[] board, boolean isWhite) {
        List<Move> pseudoMoves = new ArrayList<>();

        for (int i = 0; i < 64; i++) {
            char p = board[i];
            if (p == '.') continue;
            boolean pieceIsWhite = Character.isUpperCase(p);
            if (pieceIsWhite != isWhite) continue;

            int row = i / 8;
            int col = i % 8;

            switch (Character.toUpperCase(p)) {
                case 'P':
                    generatePawnMoves(board, i, row, col, isWhite, pseudoMoves);
                    break;
                case 'N':
                    generateKnightMoves(board, i, row, col, isWhite, pseudoMoves);
                    break;
                case 'B':
                    generateRayMoves(board, i, row, col, isWhite, new int[][]{{-1,-1},{-1,1},{1,-1},{1,1}}, pseudoMoves);
                    break;
                case 'R':
                    generateRayMoves(board, i, row, col, isWhite, new int[][]{{-1,0},{1,0},{0,-1},{0,1}}, pseudoMoves);
                    break;
                case 'Q':
                    generateRayMoves(board, i, row, col, isWhite, new int[][]{{-1,-1},{-1,1},{1,-1},{1,1},{-1,0},{1,0},{0,-1},{0,1}}, pseudoMoves);
                    break;
                case 'K':
                    generateKingMoves(board, i, row, col, isWhite, pseudoMoves);
                    break;
            }
        }

        // Filter moves that leave own King in check
        List<Move> legalMoves = new ArrayList<>();
        for (Move move : pseudoMoves) {
            makeMove(board, move);
            if (!isKingInCheck(board, isWhite)) {
                legalMoves.add(move);
            }
            unmakeMove(board, move);
        }

        return legalMoves;
    }

    private void generatePawnMoves(char[] board, int i, int row, int col, boolean isWhite, List<Move> moves) {
        int dir = isWhite ? -1 : 1;
        int startRow = isWhite ? 6 : 1;
        int promoRow = isWhite ? 0 : 7;
        char[] promotions = isWhite ? new char[]{'Q','R','B','N'} : new char[]{'q','r','b','n'};

        // 1-step forward
        int forwardRow = row + dir;
        if (forwardRow >= 0 && forwardRow <= 7) {
            int to = forwardRow * 8 + col;
            if (board[to] == '.') {
                if (forwardRow == promoRow) {
                    for (char promo : promotions) {
                        moves.add(new Move(i, to, board[i], '.', promo));
                    }
                } else {
                    moves.add(new Move(i, to, board[i], '.', ' '));
                    // 2-step forward
                    if (row == startRow) {
                        int twoStep = (row + 2 * dir) * 8 + col;
                        if (board[twoStep] == '.') {
                            moves.add(new Move(i, twoStep, board[i], '.', ' '));
                        }
                    }
                }
            }
        }

        // Captures
        for (int dCol : new int[]{-1, 1}) {
            int captureCol = col + dCol;
            if (captureCol >= 0 && captureCol <= 7 && forwardRow >= 0 && forwardRow <= 7) {
                int to = forwardRow * 8 + captureCol;
                char target = board[to];
                if (target != '.' && (Character.isUpperCase(target) != isWhite)) {
                    if (forwardRow == promoRow) {
                        for (char promo : promotions) {
                            moves.add(new Move(i, to, board[i], target, promo));
                        }
                    } else {
                        moves.add(new Move(i, to, board[i], target, ' '));
                    }
                }
            }
        }
    }

    private void generateKnightMoves(char[] board, int i, int row, int col, boolean isWhite, List<Move> moves) {
        int[][] jumps = {{-2,-1},{-2,1},{-1,-2},{-1,2},{1,-2},{1,2},{2,-1},{2,1}};
        for (int[] j : jumps) {
            int r = row + j[0];
            int c = col + j[1];
            if (r >= 0 && r <= 7 && c >= 0 && c <= 7) {
                int to = r * 8 + c;
                char target = board[to];
                if (target == '.' || (Character.isUpperCase(target) != isWhite)) {
                    moves.add(new Move(i, to, board[i], target, ' '));
                }
            }
        }
    }

    private void generateRayMoves(char[] board, int i, int row, int col, boolean isWhite, int[][] dirs, List<Move> moves) {
        for (int[] d : dirs) {
            int r = row + d[0];
            int c = col + d[1];
            while (r >= 0 && r <= 7 && c >= 0 && c <= 7) {
                int to = r * 8 + c;
                char target = board[to];
                if (target == '.') {
                    moves.add(new Move(i, to, board[i], '.', ' '));
                } else {
                    if (Character.isUpperCase(target) != isWhite) {
                        moves.add(new Move(i, to, board[i], target, ' '));
                    }
                    break;
                }
                r += d[0];
                c += d[1];
            }
        }
    }

    private void generateKingMoves(char[] board, int i, int row, int col, boolean isWhite, List<Move> moves) {
        int[][] dirs = {{-1,-1},{-1,0},{-1,1},{0,-1},{0,1},{1,-1},{1,0},{1,1}};
        for (int[] d : dirs) {
            int r = row + d[0];
            int c = col + d[1];
            if (r >= 0 && r <= 7 && c >= 0 && c <= 7) {
                int to = r * 8 + c;
                char target = board[to];
                if (target == '.' || (Character.isUpperCase(target) != isWhite)) {
                    moves.add(new Move(i, to, board[i], target, ' '));
                }
            }
        }
    }

    private boolean isKingInCheck(char[] board, boolean isWhite) {
        char king = isWhite ? 'K' : 'k';
        int kingPos = -1;
        for (int i = 0; i < 64; i++) {
            if (board[i] == king) {
                kingPos = i;
                break;
            }
        }
        if (kingPos == -1) return true; // King missing

        int kRow = kingPos / 8;
        int kCol = kingPos % 8;

        // Check opponent knight attacks
        char oppKnight = isWhite ? 'n' : 'N';
        int[][] knightJumps = {{-2,-1},{-2,1},{-1,-2},{-1,2},{1,-2},{1,2},{2,-1},{2,1}};
        for (int[] j : knightJumps) {
            int r = kRow + j[0];
            int c = kCol + j[1];
            if (r >= 0 && r <= 7 && c >= 0 && c <= 7) {
                if (board[r * 8 + c] == oppKnight) return true;
            }
        }

        // Check opponent pawn attacks
        int pawnDir = isWhite ? -1 : 1;
        char oppPawn = isWhite ? 'p' : 'P';
        for (int dCol : new int[]{-1, 1}) {
            int r = kRow + pawnDir;
            int c = kCol + dCol;
            if (r >= 0 && r <= 7 && c >= 0 && c <= 7) {
                if (board[r * 8 + c] == oppPawn) return true;
            }
        }

        // Check ray attacks (Queen, Rook, Bishop)
        char oppRook = isWhite ? 'r' : 'R';
        char oppBishop = isWhite ? 'b' : 'B';
        char oppQueen = isWhite ? 'q' : 'Q';

        // Orthogonal (Rook/Queen)
        for (int[] d : new int[][]{{-1,0},{1,0},{0,-1},{0,1}}) {
            int r = kRow + d[0];
            int c = kCol + d[1];
            while (r >= 0 && r <= 7 && c >= 0 && c <= 7) {
                char target = board[r * 8 + c];
                if (target != '.') {
                    if (target == oppRook || target == oppQueen) return true;
                    break;
                }
                r += d[0];
                c += d[1];
            }
        }

        // Diagonal (Bishop/Queen)
        for (int[] d : new int[][]{{-1,-1},{-1,1},{1,-1},{1,1}}) {
            int r = kRow + d[0];
            int c = kCol + d[1];
            while (r >= 0 && r <= 7 && c >= 0 && c <= 7) {
                char target = board[r * 8 + c];
                if (target != '.') {
                    if (target == oppBishop || target == oppQueen) return true;
                    break;
                }
                r += d[0];
                c += d[1];
            }
        }

        // Check adjacent opponent king
        char oppKing = isWhite ? 'k' : 'K';
        for (int[] d : new int[][]{{-1,-1},{-1,0},{-1,1},{0,-1},{0,1},{1,-1},{1,0},{1,1}}) {
            int r = kRow + d[0];
            int c = kCol + d[1];
            if (r >= 0 && r <= 7 && c >= 0 && c <= 7) {
                if (board[r * 8 + c] == oppKing) return true;
            }
        }

        return false;
    }

    private String formatSan(Move move, char[] board, List<Move> legalMoves) {
        char pieceType = Character.toUpperCase(move.piece);
        boolean isCapture = move.captured != '.';

        if (pieceType == 'P') {
            if (isCapture) {
                String san = "" + move.getFromCoord().charAt(0) + "x" + move.getToCoord();
                if (move.promotion != ' ') {
                    san += "=" + Character.toUpperCase(move.promotion);
                }
                return san;
            } else {
                String san = move.getToCoord();
                if (move.promotion != ' ') {
                    san += "=" + Character.toUpperCase(move.promotion);
                }
                return san;
            }
        }

        StringBuilder sb = new StringBuilder();
        sb.append(pieceType);

        // Ambiguity check
        boolean disambiguateFile = false;
        boolean disambiguateRank = false;
        for (Move m : legalMoves) {
            if (m != move && Character.toUpperCase(m.piece) == pieceType && m.to == move.to) {
                if (m.from % 8 != move.from % 8) disambiguateFile = true;
                else disambiguateRank = true;
            }
        }

        if (disambiguateFile) sb.append(move.getFromCoord().charAt(0));
        if (disambiguateRank) sb.append(move.getFromCoord().charAt(1));

        if (isCapture) sb.append('x');
        sb.append(move.getToCoord());

        return sb.toString();
    }
}
