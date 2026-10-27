import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../models/chess_models.dart';
import '../providers/game_provider.dart';
import '../widgets/captured_pieces_widget.dart';
import '../widgets/chess_board_widget.dart';
import '../widgets/game_clock_widget.dart';

class AiGameScreen extends StatefulWidget {
  const AiGameScreen({super.key});

  @override
  State<AiGameScreen> createState() => _AiGameScreenState();
}

class _AiGameScreenState extends State<AiGameScreen> {
  int _selectedDifficulty = 2;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<GameProvider>(context, listen: false).initNewGame(
        newMode: GameMode.vsAi,
        difficulty: _selectedDifficulty,
        playerColor: PieceColor.white,
      );
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
              Provider.of<GameProvider>(context, listen: false).initNewGame(
                newMode: GameMode.vsAi,
                difficulty: _selectedDifficulty,
              );
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

    if (engine.isGameOver) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (engine.status == GameStatus.checkmate) {
          final isPlayerWinner = engine.activeColor != game.humanColor;
          _showGameOverDialog(
            context,
            isPlayerWinner ? 'Victory!' : 'Defeat',
            isPlayerWinner ? 'You defeated the AI by checkmate!' : 'AI won by checkmate.',
          );
        } else if (engine.status == GameStatus.stalemate) {
          _showGameOverDialog(context, 'Stalemate', 'Draw by stalemate.');
        }
      });
    }

    final isAiTurn = engine.activeColor != game.humanColor;
    final diffLabels = {1: 'Beginner', 2: 'Intermediate', 3: 'Master'};

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Play vs AI Opponent'),
        actions: [
          PopupMenuButton<int>(
            icon: const Icon(Icons.tune, size: 20),
            tooltip: 'Difficulty Level',
            initialValue: _selectedDifficulty,
            onSelected: (val) {
              setState(() => _selectedDifficulty = val);
              game.initNewGame(newMode: GameMode.vsAi, difficulty: val);
            },
            itemBuilder: (context) => [
              const PopupMenuItem(value: 1, child: Text('Beginner (Depth 1)')),
              const PopupMenuItem(value: 2, child: Text('Intermediate (Depth 2)')),
              const PopupMenuItem(value: 3, child: Text('Master (Depth 3)')),
            ],
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'New AI Match',
            onPressed: () => game.initNewGame(newMode: GameMode.vsAi, difficulty: _selectedDifficulty),
          ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // AI Clock & Status
              GameClockWidget(
                playerName: 'ChessBot AI (${diffLabels[_selectedDifficulty]})',
                playerSubtitle: game.isAiThinking ? '🧠 Calculating best move...' : (isAiTurn ? 'Turn to Move' : 'Waiting'),
                timeSeconds: game.blackTimeSeconds,
                isActive: isAiTurn,
                trailing: game.isAiThinking
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.accentAmber),
                      )
                    : null,
              ),

              // Captured pieces
              CapturedPiecesWidget(
                capturedPieces: engine.capturedWhitePieces,
                advantage: -engine.materialAdvantage,
              ),

              // Central Board
              Center(
                child: ChessBoardWidget(
                  engine: engine,
                  selectedIndex: game.selectedSquareIndex,
                  validDestinations: game.validDestinations,
                  lastMoveFrom: game.lastMoveFromIndex,
                  lastMoveTo: game.lastMoveToIndex,
                  onSquareTap: game.onSquareTapped,
                  isFlipped: game.humanColor == PieceColor.black,
                ),
              ),

              // Captured pieces
              CapturedPiecesWidget(
                capturedPieces: engine.capturedBlackPieces,
                advantage: engine.materialAdvantage,
              ),

              // Human Clock & Info
              GameClockWidget(
                playerName: 'You (Human)',
                playerSubtitle: !isAiTurn ? 'Your Turn' : 'Waiting for AI',
                timeSeconds: game.whiteTimeSeconds,
                isActive: !isAiTurn,
              ),

              // Controls
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  OutlinedButton.icon(
                    onPressed: () {
                      _showGameOverDialog(context, 'Resigned', 'You conceded to the AI.');
                    },
                    icon: const Icon(Icons.flag_outlined, size: 16, color: AppTheme.accentRed),
                    label: const Text('Resign', style: TextStyle(color: AppTheme.accentRed, fontSize: 12)),
                  ),
                  OutlinedButton.icon(
                    onPressed: () {
                      game.initNewGame(newMode: GameMode.vsAi, difficulty: _selectedDifficulty);
                    },
                    icon: const Icon(Icons.replay, size: 16),
                    label: const Text('Rematch', style: TextStyle(fontSize: 12)),
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
