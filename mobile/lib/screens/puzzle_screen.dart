import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../providers/puzzle_provider.dart';
import '../widgets/chess_board_widget.dart';

class PuzzleScreen extends StatefulWidget {
  const PuzzleScreen({super.key});

  @override
  State<PuzzleScreen> createState() => _PuzzleScreenState();
}

class _PuzzleScreenState extends State<PuzzleScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<PuzzleProvider>(context, listen: false).loadDailyPuzzle();
    });
  }

  @override
  Widget build(BuildContext context) {
    final puzzles = Provider.of<PuzzleProvider>(context);
    final puzzle = puzzles.currentPuzzle;

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Tactical Puzzles'),
        actions: [
          IconButton(
            icon: const Icon(Icons.shuffle),
            tooltip: 'Random Puzzle',
            onPressed: () => puzzles.loadRandomPuzzle(),
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Reset Puzzle',
            onPressed: () => puzzles.resetPuzzle(),
          ),
        ],
      ),
      body: SafeArea(
        child: puzzles.isLoading
            ? const Center(
                child: CircularProgressIndicator(color: AppTheme.accentPurple),
              )
            : puzzles.errorMessage != null
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24.0),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.error_outline, size: 48, color: AppTheme.accentRed),
                          const SizedBox(height: 16),
                          Text(puzzles.errorMessage!, textAlign: TextAlign.center, style: const TextStyle(color: Colors.white70)),
                          const SizedBox(height: 16),
                          ElevatedButton(
                            onPressed: () => puzzles.loadDailyPuzzle(),
                            child: const Text('Retry'),
                          ),
                        ],
                      ),
                    ),
                  )
                : puzzle == null
                    ? const SizedBox()
                    : Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            // Puzzle Header Banner
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: AppTheme.surfaceElevated,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: AppTheme.border),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        puzzle.title,
                                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.white),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        '${puzzle.theme} • ${puzzle.playerToMove.toUpperCase()} to move',
                                        style: const TextStyle(fontSize: 11, color: Colors.white54),
                                      ),
                                    ],
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: AppTheme.accentPurple.withOpacity(0.2),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      '⭐ ${puzzle.rating}',
                                      style: const TextStyle(
                                        color: AppTheme.accentPurple,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 13,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),

                            // Solved / Failed Banner
                            if (puzzles.isSolved)
                              Container(
                                padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                                decoration: BoxDecoration(
                                  color: AppTheme.primaryGreen.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: AppTheme.primaryGreen),
                                ),
                                child: const Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(Icons.check_circle, size: 18, color: AppTheme.primaryGreen),
                                    SizedBox(width: 8),
                                    Text('Solved! +15 Rating Points',
                                        style: TextStyle(color: AppTheme.primaryGreen, fontWeight: FontWeight.bold)),
                                  ],
                                ),
                              )
                            else if (puzzles.isFailed)
                              Container(
                                padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                                decoration: BoxDecoration(
                                  color: AppTheme.accentRed.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: AppTheme.accentRed),
                                ),
                                child: const Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(Icons.cancel, size: 18, color: AppTheme.accentRed),
                                    SizedBox(width: 8),
                                    Text('Incorrect Move. Try again!',
                                        style: TextStyle(color: AppTheme.accentRed, fontWeight: FontWeight.bold)),
                                  ],
                                ),
                              ),

                            // Chess Board
                            Center(
                              child: ChessBoardWidget(
                                engine: puzzles.engine,
                                selectedIndex: puzzles.selectedSquareIndex,
                                validDestinations: puzzles.validDestinations,
                                onSquareTap: puzzles.onSquareTapped,
                                isFlipped: puzzle.playerToMove == 'black',
                              ),
                            ),

                            // Action buttons
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                              children: [
                                OutlinedButton.icon(
                                  onPressed: () => puzzles.resetPuzzle(),
                                  icon: const Icon(Icons.replay, size: 16),
                                  label: const Text('Reset', style: TextStyle(fontSize: 12)),
                                ),
                                ElevatedButton.icon(
                                  onPressed: () => puzzles.loadRandomPuzzle(),
                                  icon: const Icon(Icons.arrow_forward, size: 16),
                                  label: const Text('Next Puzzle', style: TextStyle(fontSize: 12)),
                                  style: ElevatedButton.styleFrom(backgroundColor: AppTheme.accentPurple),
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
