import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../engine/chess_engine.dart';
import '../models/chess_models.dart';

class ChessBoardWidget extends StatelessWidget {
  final ChessEngine engine;
  final int? selectedIndex;
  final List<int> validDestinations;
  final int? lastMoveFrom;
  final int? lastMoveTo;
  final Function(int) onSquareTap;
  final bool isFlipped;

  const ChessBoardWidget({
    super.key,
    required this.engine,
    this.selectedIndex,
    this.validDestinations = const [],
    this.lastMoveFrom,
    this.lastMoveTo,
    required this.onSquareTap,
    this.isFlipped = false,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(builder: (context, constraints) {
      final boardSize = constraints.maxWidth < constraints.maxHeight
          ? constraints.maxWidth
          : constraints.maxHeight;

      return Container(
        width: boardSize,
        height: boardSize,
        decoration: BoxDecoration(
          border: Border.all(color: AppTheme.border, width: 2),
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.5),
              blurRadius: 16,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(10),
          child: GridView.builder(
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 8,
            ),
            itemCount: 64,
            itemBuilder: (context, displayIndex) {
              // Handle perspective flipping (if black player view)
              final actualIndex = isFlipped ? (63 - displayIndex) : displayIndex;

              final row = ChessEngine.rowFromIndex(actualIndex);
              final col = ChessEngine.colFromIndex(actualIndex);
              final isLightSquare = (row + col) % 2 == 0;

              final piece = engine.pieceAt(actualIndex);
              final isSelected = selectedIndex == actualIndex;
              final isValidDest = validDestinations.contains(actualIndex);
              final isLastMove = lastMoveFrom == actualIndex || lastMoveTo == actualIndex;

              // Check if king is in check
              final isKingInCheck = piece != null &&
                  piece.type == PieceType.king &&
                  piece.color == engine.activeColor &&
                  engine.isInCheck(piece.color);

              Color squareColor = isLightSquare
                  ? AppTheme.boardLightSquare
                  : AppTheme.boardDarkSquare;

              if (isSelected) {
                squareColor = AppTheme.boardHighlight;
              } else if (isLastMove) {
                squareColor = Color.lerp(squareColor, AppTheme.boardHighlight, 0.5)!;
              }

              return GestureDetector(
                onTap: () => onSquareTap(actualIndex),
                child: Container(
                  color: squareColor,
                  child: Stack(
                    children: [
                      // King in check red radial glow
                      if (isKingInCheck)
                        Container(
                          decoration: const BoxDecoration(
                            color: AppTheme.boardCheckGlow,
                            shape: BoxShape.circle,
                          ),
                        ),

                      // Rank & File Coordinates on board margins
                      _buildCoordinates(row, col, isLightSquare),

                      // Destination indicator (dot for move, ring for capture)
                      if (isValidDest)
                        Center(
                          child: Container(
                            width: piece == null ? 14 : 32,
                            height: piece == null ? 14 : 32,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: piece == null
                                  ? Colors.black.withOpacity(0.25)
                                  : Colors.transparent,
                              border: piece != null
                                  ? Border.all(
                                      color: Colors.black.withOpacity(0.35),
                                      width: 4,
                                    )
                                  : null,
                            ),
                          ),
                        ),

                      // Chess Piece
                      if (piece != null)
                        Center(
                          child: Text(
                            piece.unicodeGlyph,
                            style: TextStyle(
                              fontSize: boardSize * 0.088,
                              color: piece.color == PieceColor.white
                                  ? Colors.white
                                  : Colors.black87,
                              shadows: [
                                Shadow(
                                  blurRadius: 3,
                                  color: piece.color == PieceColor.white
                                      ? Colors.black.withOpacity(0.7)
                                      : Colors.white.withOpacity(0.5),
                                  offset: const Offset(1, 1),
                                ),
                              ],
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      );
    });
  }

  Widget _buildCoordinates(int row, int col, bool isLightSquare) {
    final coordColor = isLightSquare ? AppTheme.boardDarkSquare : AppTheme.boardLightSquare;

    return Stack(
      children: [
        if (col == (isFlipped ? 7 : 0))
          Positioned(
            top: 2,
            left: 3,
            child: Text(
              '${8 - row}',
              style: TextStyle(
                fontSize: 9,
                fontWeight: FontWeight.bold,
                color: coordColor.withOpacity(0.85),
              ),
            ),
          ),
        if (row == (isFlipped ? 0 : 7))
          Positioned(
            bottom: 2,
            right: 3,
            child: Text(
              String.fromCharCode('a'.codeUnitAt(0) + col),
              style: TextStyle(
                fontSize: 9,
                fontWeight: FontWeight.bold,
                color: coordColor.withOpacity(0.85),
              ),
            ),
          ),
      ],
    );
  }
}
