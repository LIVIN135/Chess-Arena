import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../models/chess_models.dart';
import '../providers/game_provider.dart';
import '../widgets/captured_pieces_widget.dart';
import '../widgets/chess_board_widget.dart';
import '../widgets/game_clock_widget.dart';

class LocalGameScreen extends StatefulWidget {
  const LocalGameScreen({super.key});

  @override
  State<LocalGameScreen> createState() => _LocalGameScreenState();
}

class _LocalGameScreenState extends State<LocalGameScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<GameProvider>(context, listen: false)
          .initNewGame(newMode: GameMode.localPassAndPlay);
    });
  }

  void _showGameOverDialog(BuildContext context, String title, String message) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        backgroundColor: AppTheme.surface,
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        content: Text(message, style: const TextStyle(color: Colors.white70)),
        actions: [
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              Provider.of<GameProvider>(context, listen: false).initNewGame();
            },
            child: const Text('Play Again'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              Navigator.of(context).pop();
            },
            child: const Text('Exit', style: TextStyle(color: Colors.white54)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final game = Provider.of<GameProvider>(context);
    final engine = game.engine;

    // Check game over
    if (engine.isGameOver) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (engine.status == GameStatus.checkmate) {
          final winner = engine.activeColor == PieceColor.white ? 'Black' : 'White';
          _showGameOverDialog(context, 'Checkmate!', '$winner won by checkmate.');
        } else if (engine.status == GameStatus.stalemate) {
          _showGameOverDialog(context, 'Stalemate', 'Draw by stalemate.');
        }
      });
    }

    final isBlackTurn = engine.activeColor == PieceColor.black;
    final isWhiteTurn = engine.activeColor == PieceColor.white;

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Pass & Play'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Restart Game',
            onPressed: () => game.initNewGame(),
          ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Black Clock & Info
              GameClockWidget(
                playerName: 'Black (Guest)',
                playerSubtitle: isBlackTurn ? 'Turn to Move' : 'Waiting',
                timeSeconds: game.blackTimeSeconds,
                isActive: isBlackTurn,
              ),

              // Black's captured pieces (taken from White)
              CapturedPiecesWidget(
                capturedPieces: engine.capturedWhitePieces,
                advantage: -engine.materialAdvantage,
              ),

              // The Chessboard
              Center(
                child: ChessBoardWidget(
                  engine: engine,
                  selectedIndex: game.selectedSquareIndex,
                  validDestinations: game.validDestinations,
                  lastMoveFrom: game.lastMoveFromIndex,
                  lastMoveTo: game.lastMoveToIndex,
                  onSquareTap: game.onSquareTapped,
                ),
              ),

              // White's captured pieces (taken from Black)
              CapturedPiecesWidget(
                capturedPieces: engine.capturedBlackPieces,
                advantage: engine.materialAdvantage,
              ),

              // White Clock & Info
              GameClockWidget(
                playerName: 'White (Guest)',
                playerSubtitle: isWhiteTurn ? 'Turn to Move' : 'Waiting',
                timeSeconds: game.whiteTimeSeconds,
                isActive: isWhiteTurn,
              ),

              // Bottom control buttons
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  OutlinedButton.icon(
                    onPressed: () {
                      _showGameOverDialog(
                          context, 'Resigned', '${engine.activeColor.name.toUpperCase()} resigned.');
                    },
                    icon: const Icon(Icons.flag_outlined, size: 16, color: AppTheme.accentRed),
                    label: const Text('Resign', style: TextStyle(color: AppTheme.accentRed, fontSize: 12)),
                  ),
                  OutlinedButton.icon(
                    onPressed: () => game.initNewGame(),
                    icon: const Icon(Icons.replay, size: 16),
                    label: const Text('New Match', style: TextStyle(fontSize: 12)),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
