import 'dart:math';
import '../models/chess_models.dart';

class ChessEngine {
  List<ChessPiece?> board = List.filled(64, null);
  PieceColor activeColor = PieceColor.white;
  bool canWhiteCastleKingside = true;
  bool canWhiteCastleQueenside = true;
  bool canBlackCastleKingside = true;
  bool canBlackCastleQueenside = true;
  int? enPassantTargetSquare; // 0..63 index
  int halfmoveClock = 0;
  int fullmoveNumber = 1;

  final List<ChessMove> moveHistory = [];
  final List<ChessPiece> capturedWhitePieces = [];
  final List<ChessPiece> capturedBlackPieces = [];

  static const String initialFen =
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  ChessEngine([String fen = initialFen]) {
    loadFen(fen);
  }

  // Convert row (0..7, where 0 is 8th rank) and col (0..7, where 0 is 'a') to index
  static int squareToIndex(int row, int col) => row * 8 + col;
  static int rowFromIndex(int index) => index ~/ 8;
  static int colFromIndex(int index) => index % 8;

  static String indexToSquare(int index) {
    final col = colFromIndex(index);
    final row = 8 - rowFromIndex(index);
    return '${String.fromCharCode('a'.codeUnitAt(0) + col)}$row';
  }

  static int squareNameToIndex(String name) {
    if (name.length < 2) return 0;
    final col = name.codeUnitAt(0) - 'a'.codeUnitAt(0);
    final row = 8 - int.parse(name[1]);
    return squareToIndex(row, col);
  }

  void loadFen(String fen) {
    board = List.filled(64, null);
    final parts = fen.trim().split(' ');
    final piecePlacement = parts[0];

    int row = 0;
    int col = 0;

    for (int i = 0; i < piecePlacement.length; i++) {
      final char = piecePlacement[i];
      if (char == '/') {
        row++;
        col = 0;
      } else if (int.tryParse(char) != null) {
        col += int.parse(char);
      } else {
        final piece = ChessPiece.fromFenChar(char);
        if (piece != null && row < 8 && col < 8) {
          board[squareToIndex(row, col)] = piece;
        }
        col++;
      }
    }

    if (parts.length > 1) {
      activeColor = parts[1] == 'b' ? PieceColor.black : PieceColor.white;
    }
    if (parts.length > 2) {
      final castling = parts[2];
      canWhiteCastleKingside = castling.contains('K');
      canWhiteCastleQueenside = castling.contains('Q');
      canBlackCastleKingside = castling.contains('k');
      canBlackCastleQueenside = castling.contains('q');
    }
    if (parts.length > 3 && parts[3] != '-') {
      enPassantTargetSquare = squareNameToIndex(parts[3]);
    } else {
      enPassantTargetSquare = null;
    }
    if (parts.length > 4) {
      halfmoveClock = int.tryParse(parts[4]) ?? 0;
    }
    if (parts.length > 5) {
      fullmoveNumber = int.tryParse(parts[5]) ?? 1;
    }
  }

  String generateFen() {
    final buffer = StringBuffer();
    for (int row = 0; row < 8; row++) {
      int emptyCount = 0;
      for (int col = 0; col < 8; col++) {
        final piece = board[squareToIndex(row, col)];
        if (piece == null) {
          emptyCount++;
        } else {
          if (emptyCount > 0) {
            buffer.write(emptyCount);
            emptyCount = 0;
          }
          buffer.write(piece.fenChar);
        }
      }
      if (emptyCount > 0) {
        buffer.write(emptyCount);
      }
      if (row < 7) {
        buffer.write('/');
      }
    }

    buffer.write(' ');
    buffer.write(activeColor == PieceColor.white ? 'w' : 'b');
    buffer.write(' ');

    String castling = '';
    if (canWhiteCastleKingside) castling += 'K';
    if (canWhiteCastleQueenside) castling += 'Q';
    if (canBlackCastleKingside) castling += 'k';
    if (canBlackCastleQueenside) castling += 'q';
    buffer.write(castling.isEmpty ? '-' : castling);

    buffer.write(' ');
    buffer.write(enPassantTargetSquare != null
        ? indexToSquare(enPassantTargetSquare!)
        : '-');

    buffer.write(' $halfmoveClock $fullmoveNumber');
    return buffer.toString();
  }

  ChessPiece? pieceAt(int index) => board[index];
  ChessPiece? pieceAtSquare(String square) => board[squareNameToIndex(square)];

  List<int> getLegalDestinations(int fromIndex) {
    final piece = board[fromIndex];
    if (piece == null || piece.color != activeColor) return [];

    final candidates = _generatePseudoLegalMovesForPiece(fromIndex);
    final legal = <int>[];

    for (final toIndex in candidates) {
      if (_isMoveSafe(fromIndex, toIndex)) {
        legal.add(toIndex);
      }
    }
    return legal;
  }

  List<ChessMove> getAllLegalMoves() {
    final moves = <ChessMove>[];
    for (int i = 0; i < 64; i++) {
      final piece = board[i];
      if (piece != null && piece.color == activeColor) {
        final destinations = getLegalDestinations(i);
        for (final dest in destinations) {
          final fromSq = indexToSquare(i);
          final toSq = indexToSquare(dest);
          final captured = board[dest];
          final san = _formatSan(i, dest, piece, captured);
          moves.add(ChessMove(
            from: fromSq,
            to: toSq,
            piece: piece,
            capturedPiece: captured,
            san: san,
          ));
        }
      }
    }
    return moves;
  }

  bool makeMove(String fromSquare, String toSquare, [PieceType? promotion]) {
    final from = squareNameToIndex(fromSquare);
    final to = squareNameToIndex(toSquare);

    final legal = getLegalDestinations(from);
    if (!legal.contains(to)) {
      return false;
    }

    final movingPiece = board[from]!;
    final capturedPiece = board[to];

    // En Passant capture
    if (movingPiece.type == PieceType.pawn &&
        to == enPassantTargetSquare &&
        capturedPiece == null) {
      final epCapturedIndex = squareToIndex(
          rowFromIndex(from), colFromIndex(to));
      final epCaptured = board[epCapturedIndex];
      if (epCaptured != null) {
        _recordCapturedPiece(epCaptured);
        board[epCapturedIndex] = null;
      }
    } else if (capturedPiece != null) {
      _recordCapturedPiece(capturedPiece);
    }

    // Castling rook movement
    bool isCastling = false;
    if (movingPiece.type == PieceType.king) {
      final fromCol = colFromIndex(from);
      final toCol = colFromIndex(to);
      final row = rowFromIndex(from);
      if ((toCol - fromCol).abs() == 2) {
        isCastling = true;
        if (toCol == 6) {
          // Kingside: Move rook from col 7 to col 5
          final rook = board[squareToIndex(row, 7)];
          board[squareToIndex(row, 7)] = null;
          board[squareToIndex(row, 5)] = rook;
        } else if (toCol == 2) {
          // Queenside: Move rook from col 0 to col 3
          final rook = board[squareToIndex(row, 0)];
          board[squareToIndex(row, 0)] = null;
          board[squareToIndex(row, 3)] = rook;
        }
      }
    }

    // Move piece on board
    ChessPiece placedPiece = movingPiece;
    if (movingPiece.type == PieceType.pawn) {
      final targetRow = rowFromIndex(to);
      if (targetRow == 0 || targetRow == 7) {
        placedPiece = ChessPiece(
          type: promotion ?? PieceType.queen,
          color: movingPiece.color,
        );
      }
    }

    board[to] = placedPiece;
    board[from] = null;

    // Update En Passant target
    if (movingPiece.type == PieceType.pawn &&
        (rowFromIndex(to) - rowFromIndex(from)).abs() == 2) {
      final epRow = (rowFromIndex(from) + rowFromIndex(to)) ~/ 2;
      enPassantTargetSquare = squareToIndex(epRow, colFromIndex(from));
    } else {
      enPassantTargetSquare = null;
    }

    // Update castling rights
    if (movingPiece.type == PieceType.king) {
      if (movingPiece.color == PieceColor.white) {
        canWhiteCastleKingside = false;
        canWhiteCastleQueenside = false;
      } else {
        canBlackCastleKingside = false;
        canBlackCastleQueenside = false;
      }
    } else if (movingPiece.type == PieceType.rook) {
      if (from == squareToIndex(7, 7)) canWhiteCastleKingside = false;
      if (from == squareToIndex(7, 0)) canWhiteCastleQueenside = false;
      if (from == squareToIndex(0, 7)) canBlackCastleKingside = false;
      if (from == squareToIndex(0, 0)) canBlackCastleQueenside = false;
    }

    // Switch turn
    activeColor = activeColor == PieceColor.white
        ? PieceColor.black
        : PieceColor.white;

    if (activeColor == PieceColor.white) {
      fullmoveNumber++;
    }

    final isCheck = isInCheck(activeColor);
    final hasMoves = getAllLegalMoves().isNotEmpty;
    final isCheckmate = isCheck && !hasMoves;

    final san = _formatSan(from, to, movingPiece, capturedPiece,
        isCheck: isCheck, isCheckmate: isCheckmate, isCastling: isCastling);

    moveHistory.add(ChessMove(
      from: fromSquare,
      to: toSquare,
      piece: movingPiece,
      capturedPiece: capturedPiece,
      promotion: promotion,
      san: san,
      isCheck: isCheck,
      isCheckmate: isCheckmate,
      isCastling: isCastling,
    ));

    return true;
  }

  void _recordCapturedPiece(ChessPiece piece) {
    if (piece.color == PieceColor.white) {
      capturedWhitePieces.add(piece);
    } else {
      capturedBlackPieces.add(piece);
    }
  }

  bool isInCheck(PieceColor color) {
    int kingIndex = -1;
    for (int i = 0; i < 64; i++) {
      final p = board[i];
      if (p != null && p.type == PieceType.king && p.color == color) {
        kingIndex = i;
        break;
      }
    }
    if (kingIndex == -1) return false;
    final opponentColor =
        color == PieceColor.white ? PieceColor.black : PieceColor.white;
    return _isSquareAttackedBy(kingIndex, opponentColor);
  }

  bool get isGameOver {
    final moves = getAllLegalMoves();
    if (moves.isEmpty) return true;
    return false;
  }

  GameStatus get status {
    final moves = getAllLegalMoves();
    if (moves.isEmpty) {
      return isInCheck(activeColor) ? GameStatus.checkmate : GameStatus.stalemate;
    }
    return GameStatus.inProgress;
  }

  int get materialAdvantage {
    int whiteScore = 0;
    int blackScore = 0;
    for (final p in board) {
      if (p != null) {
        if (p.color == PieceColor.white) {
          whiteScore += p.materialValue;
        } else {
          blackScore += p.materialValue;
        }
      }
    }
    return whiteScore - blackScore;
  }

  // --- Move Generation Internals ---
  List<int> _generatePseudoLegalMovesForPiece(int index) {
    final piece = board[index];
    if (piece == null) return [];

    final row = rowFromIndex(index);
    final col = colFromIndex(index);
    final moves = <int>[];

    switch (piece.type) {
      case PieceType.pawn:
        final direction = piece.color == PieceColor.white ? -1 : 1;
        final startRow = piece.color == PieceColor.white ? 6 : 1;

        // 1-step forward
        final nextRow = row + direction;
        if (nextRow >= 0 && nextRow < 8) {
          final forwardIndex = squareToIndex(nextRow, col);
          if (board[forwardIndex] == null) {
            moves.add(forwardIndex);
            // 2-step forward
            if (row == startRow) {
              final doubleIndex = squareToIndex(row + 2 * direction, col);
              if (board[doubleIndex] == null) {
                moves.add(doubleIndex);
              }
            }
          }
        }

        // Diagonal captures
        for (final dc in [-1, 1]) {
          final targetCol = col + dc;
          if (nextRow >= 0 && nextRow < 8 && targetCol >= 0 && targetCol < 8) {
            final targetIndex = squareToIndex(nextRow, targetCol);
            final targetPiece = board[targetIndex];
            if (targetPiece != null && targetPiece.color != piece.color) {
              moves.add(targetIndex);
            } else if (targetIndex == enPassantTargetSquare) {
              moves.add(targetIndex);
            }
          }
        }
        break;

      case PieceType.knight:
        const offsets = [
          [-2, -1], [-2, 1], [-1, -2], [-1, 2],
          [1, -2], [1, 2], [2, -1], [2, 1],
        ];
        for (final off in offsets) {
          final r = row + off[0];
          final c = col + off[1];
          if (r >= 0 && r < 8 && c >= 0 && c < 8) {
            final target = squareToIndex(r, c);
            if (board[target] == null || board[target]!.color != piece.color) {
              moves.add(target);
            }
          }
        }
        break;

      case PieceType.bishop:
        _addRayMoves(moves, index, piece.color, const [[-1, -1], [-1, 1], [1, -1], [1, 1]]);
        break;

      case PieceType.rook:
        _addRayMoves(moves, index, piece.color, const [[-1, 0], [1, 0], [0, -1], [0, 1]]);
        break;

      case PieceType.queen:
        _addRayMoves(moves, index, piece.color, const [
          [-1, -1], [-1, 1], [1, -1], [1, 1],
          [-1, 0], [1, 0], [0, -1], [0, 1],
        ]);
        break;

      case PieceType.king:
        const kingOffsets = [
          [-1, -1], [-1, 0], [-1, 1],
          [0, -1],           [0, 1],
          [1, -1],  [1, 0],  [1, 1],
        ];
        for (final off in kingOffsets) {
          final r = row + off[0];
          final c = col + off[1];
          if (r >= 0 && r < 8 && c >= 0 && c < 8) {
            final target = squareToIndex(r, c);
            if (board[target] == null || board[target]!.color != piece.color) {
              moves.add(target);
            }
          }
        }

        // Castling checks
        if (!isInCheck(piece.color)) {
          final opponent = piece.color == PieceColor.white
              ? PieceColor.black
              : PieceColor.white;

          if (piece.color == PieceColor.white) {
            if (canWhiteCastleKingside &&
                board[squareToIndex(7, 5)] == null &&
                board[squareToIndex(7, 6)] == null &&
                !_isSquareAttackedBy(squareToIndex(7, 5), opponent) &&
                !_isSquareAttackedBy(squareToIndex(7, 6), opponent)) {
              moves.add(squareToIndex(7, 6));
            }
            if (canWhiteCastleQueenside &&
                board[squareToIndex(7, 1)] == null &&
                board[squareToIndex(7, 2)] == null &&
                board[squareToIndex(7, 3)] == null &&
                !_isSquareAttackedBy(squareToIndex(7, 2), opponent) &&
                !_isSquareAttackedBy(squareToIndex(7, 3), opponent)) {
              moves.add(squareToIndex(7, 2));
            }
          } else {
            if (canBlackCastleKingside &&
                board[squareToIndex(0, 5)] == null &&
                board[squareToIndex(0, 6)] == null &&
                !_isSquareAttackedBy(squareToIndex(0, 5), opponent) &&
                !_isSquareAttackedBy(squareToIndex(0, 6), opponent)) {
              moves.add(squareToIndex(0, 6));
            }
            if (canBlackCastleQueenside &&
                board[squareToIndex(0, 1)] == null &&
                board[squareToIndex(0, 2)] == null &&
                board[squareToIndex(0, 3)] == null &&
                !_isSquareAttackedBy(squareToIndex(0, 2), opponent) &&
                !_isSquareAttackedBy(squareToIndex(0, 3), opponent)) {
              moves.add(squareToIndex(0, 2));
            }
          }
        }
        break;
    }

    return moves;
  }

  void _addRayMoves(List<int> moves, int fromIndex, PieceColor color,
      List<List<int>> directions) {
    final row = rowFromIndex(fromIndex);
    final col = colFromIndex(fromIndex);

    for (final dir in directions) {
      int r = row + dir[0];
      int c = col + dir[1];
      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        final target = squareToIndex(r, c);
        final targetPiece = board[target];
        if (targetPiece == null) {
          moves.add(target);
        } else {
          if (targetPiece.color != color) {
            moves.add(target);
          }
          break;
        }
        r += dir[0];
        c += dir[1];
      }
    }
  }

  bool _isSquareAttackedBy(int square, PieceColor attackerColor) {
    for (int i = 0; i < 64; i++) {
      final p = board[i];
      if (p != null && p.color == attackerColor) {
        final pseudo = _generatePseudoLegalMovesForPiece(i);
        if (pseudo.contains(square)) {
          return true;
        }
      }
    }
    return false;
  }

  bool _isMoveSafe(int from, int to) {
    final movingPiece = board[from]!;
    final capturedPiece = board[to];

    board[to] = movingPiece;
    board[from] = null;

    final safe = !isInCheck(movingPiece.color);

    board[from] = movingPiece;
    board[to] = capturedPiece;

    return safe;
  }

  String _formatSan(int from, int to, ChessPiece piece, ChessPiece? captured,
      {bool isCheck = false,
      bool isCheckmate = false,
      bool isCastling = false}) {
    if (isCastling) {
      return (colFromIndex(to) == 6) ? 'O-O' : 'O-O-O';
    }
    final toSquare = indexToSquare(to);
    String str = '';
    if (piece.type == PieceType.pawn) {
      if (captured != null || to == enPassantTargetSquare) {
        str = '${indexToSquare(from)[0]}x$toSquare';
      } else {
        str = toSquare;
      }
    } else {
      final pLetter = piece.type.name.substring(0, 1).toUpperCase();
      final pChar = piece.type == PieceType.knight ? 'N' : pLetter;
      str = '$pChar${captured != null ? "x" : ""}$toSquare';
    }
    if (isCheckmate) {
      str += '#';
    } else if (isCheck) {
      str += '+';
    }
    return str;
  }

  // --- AI Minimax Engine with Alpha-Beta Pruning ---
  ChessMove? getBestMove([int depth = 2]) {
    final moves = getAllLegalMoves();
    if (moves.isEmpty) return null;

    ChessMove? bestMove;
    int bestScore = (activeColor == PieceColor.white) ? -1000000 : 1000000;
    final isMaximizing = activeColor == PieceColor.white;

    for (final move in moves) {
      final clone = ChessEngine(generateFen());
      clone.makeMove(move.from, move.to);
      final score = clone._minimax(depth - 1, -1000000, 1000000, !isMaximizing);

      if (isMaximizing) {
        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
      } else {
        if (score < bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }
    }

    return bestMove ?? (moves..shuffle()).first;
  }

  int _minimax(int depth, int alpha, int beta, bool isMaximizing) {
    if (depth == 0 || isGameOver) {
      return _evaluateBoard();
    }

    final moves = getAllLegalMoves();
    if (moves.isEmpty) {
      if (isInCheck(activeColor)) {
        return isMaximizing ? -90000 : 90000;
      }
      return 0; // Stalemate
    }

    if (isMaximizing) {
      int maxEval = -1000000;
      for (final move in moves) {
        final clone = ChessEngine(generateFen());
        clone.makeMove(move.from, move.to);
        final score = clone._minimax(depth - 1, alpha, beta, false);
        maxEval = max(maxEval, score);
        alpha = max(alpha, score);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      int minEval = 1000000;
      for (final move in moves) {
        final clone = ChessEngine(generateFen());
        clone.makeMove(move.from, move.to);
        final score = clone._minimax(depth - 1, alpha, beta, true);
        minEval = min(minEval, score);
        beta = min(beta, score);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  int _evaluateBoard() {
    int total = 0;
    for (int i = 0; i < 64; i++) {
      final p = board[i];
      if (p != null) {
        final val = switch (p.type) {
          PieceType.pawn => 100,
          PieceType.knight => 320,
          PieceType.bishop => 330,
          PieceType.rook => 500,
          PieceType.queen => 900,
          PieceType.king => 20000,
        };
        total += (p.color == PieceColor.white ? val : -val);
      }
    }
    return total;
  }
}
