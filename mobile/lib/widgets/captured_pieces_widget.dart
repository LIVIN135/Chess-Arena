import 'package:flutter/material.dart';
import '../models/chess_models.dart';

class CapturedPiecesWidget extends StatelessWidget {
  final List<ChessPiece> capturedPieces;
  final int advantage;

  const CapturedPiecesWidget({
    super.key,
    required this.capturedPieces,
    required this.advantage,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: capturedPieces.map((p) {
                return Padding(
                  padding: const EdgeInsets.only(right: 2),
                  child: Text(
                    p.unicodeGlyph,
                    style: TextStyle(
                      fontSize: 16,
                      color: p.color == PieceColor.white ? Colors.white70 : Colors.white38,
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        ),
        if (advantage > 0)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: Colors.white10,
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              '+$advantage',
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white70),
            ),
          ),
      ],
    );
  }
}
