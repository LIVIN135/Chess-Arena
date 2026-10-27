enum PieceType { pawn, knight, bishop, rook, queen, king }

enum PieceColor { white, black }

enum GameMode { localPassAndPlay, vsAi, onlineMultiplayer, puzzle }

enum GameStatus { inProgress, checkmate, stalemate, draw, resigned, timeout }

class ChessPiece {
  final PieceType type;
  final PieceColor color;

  const ChessPiece({required this.type, required this.color});

  String get fenChar {
    final char = switch (type) {
      PieceType.pawn => 'p',
      PieceType.knight => 'n',
      PieceType.bishop => 'b',
      PieceType.rook => 'r',
      PieceType.queen => 'q',
      PieceType.king => 'k',
    };
    return color == PieceColor.white ? char.toUpperCase() : char;
  }

  String get unicodeGlyph {
    if (color == PieceColor.white) {
      return switch (type) {
        PieceType.pawn => '♙',
        PieceType.knight => '♘',
        PieceType.bishop => '♗',
        PieceType.rook => '♖',
        PieceType.queen => '♕',
        PieceType.king => '♔',
      };
    } else {
      return switch (type) {
        PieceType.pawn => '♟',
        PieceType.knight => '♞',
        PieceType.bishop => '♝',
        PieceType.rook => '♜',
        PieceType.queen => '♛',
        PieceType.king => '♚',
      };
    }
  }

  int get materialValue {
    return switch (type) {
      PieceType.pawn => 1,
      PieceType.knight => 3,
      PieceType.bishop => 3,
      PieceType.rook => 5,
      PieceType.queen => 9,
      PieceType.king => 0,
    };
  }

  static ChessPiece? fromFenChar(String char) {
    if (char.isEmpty) return null;
    final isWhite = char == char.toUpperCase();
    final lower = char.toLowerCase();
    final type = switch (lower) {
      'p' => PieceType.pawn,
      'n' => PieceType.knight,
      'b' => PieceType.bishop,
      'r' => PieceType.rook,
      'q' => PieceType.queen,
      'k' => PieceType.king,
      _ => null,
    };
    if (type == null) return null;
    return ChessPiece(
      type: type,
      color: isWhite ? PieceColor.white : PieceColor.black,
    );
  }
}

class ChessMove {
  final String from; // e.g. "e2"
  final String to; // e.g. "e4"
  final ChessPiece piece;
  final ChessPiece? capturedPiece;
  final PieceType? promotion;
  final String san; // Standard Algebraic Notation, e.g. "e4", "Nf3"
  final bool isCheck;
  final bool isCheckmate;
  final bool isCastling;

  const ChessMove({
    required this.from,
    required this.to,
    required this.piece,
    this.capturedPiece,
    this.promotion,
    required this.san,
    this.isCheck = false,
    this.isCheckmate = false,
    this.isCastling = false,
  });

  String get uci => '$from$to${promotion != null ? promotion!.name[0] : ""}';
}
