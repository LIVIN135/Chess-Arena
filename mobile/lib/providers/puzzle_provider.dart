import 'package:flutter/foundation.dart';
import '../engine/chess_engine.dart';
import '../models/chess_models.dart';
import '../models/puzzle_model.dart';
import '../services/puzzle_service.dart';

class PuzzleProvider with ChangeNotifier {
  final PuzzleService _puzzleService = PuzzleService();

  PuzzleModel? currentPuzzle;
  late ChessEngine engine;
  bool isLoading = false;
  String? errorMessage;
  int currentMoveIndex = 0;
  bool isSolved = false;
  bool isFailed = false;

  int? selectedSquareIndex;
  List<int> validDestinations = [];

  PuzzleProvider() {
    engine = ChessEngine();
  }

  Future<void> loadDailyPuzzle() async {
    isLoading = true;
    errorMessage = null;
    isSolved = false;
    isFailed = false;
    currentMoveIndex = 0;
    selectedSquareIndex = null;
    validDestinations = [];
    notifyListeners();

    try {
      currentPuzzle = await _puzzleService.getDailyPuzzle();
      engine = ChessEngine(currentPuzzle!.fen);
      isLoading = false;
      notifyListeners();
    } catch (e) {
      errorMessage = e.toString().replaceAll('Exception: ', '');
      isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadRandomPuzzle() async {
    isLoading = true;
    errorMessage = null;
    isSolved = false;
    isFailed = false;
    currentMoveIndex = 0;
    selectedSquareIndex = null;
    validDestinations = [];
    notifyListeners();

    try {
      currentPuzzle = await _puzzleService.getRandomPuzzle();
      engine = ChessEngine(currentPuzzle!.fen);
      isLoading = false;
      notifyListeners();
    } catch (e) {
      errorMessage = e.toString().replaceAll('Exception: ', '');
      isLoading = false;
      notifyListeners();
    }
  }

  void onSquareTapped(int index) {
    if (isLoading || isSolved || isFailed || currentPuzzle == null) return;

    final piece = engine.pieceAt(index);

    if (selectedSquareIndex != null) {
      if (validDestinations.contains(index)) {
        final fromSq = ChessEngine.indexToSquare(selectedSquareIndex!);
        final toSq = ChessEngine.indexToSquare(index);
        final uciMove = '$fromSq$toSq';

        // Check against expected puzzle move
        if (currentMoveIndex < currentPuzzle!.moves.length) {
          final expectedUci = currentPuzzle!.moves[currentMoveIndex].toLowerCase();
          if (uciMove.toLowerCase() == expectedUci ||
              expectedUci.startsWith(uciMove.toLowerCase())) {
            // Correct move!
            engine.makeMove(fromSq, toSq);
            currentMoveIndex++;
            selectedSquareIndex = null;
            validDestinations = [];

            if (currentMoveIndex >= currentPuzzle!.moves.length) {
              isSolved = true;
              _puzzleService.submitAttempt(currentPuzzle!.id, true, 20);
            } else {
              // Play opponent reply from puzzle sequence
              _playOpponentPuzzleReply();
            }
            notifyListeners();
            return;
          } else {
            // Incorrect move
            isFailed = true;
            _puzzleService.submitAttempt(currentPuzzle!.id, false, 15);
            selectedSquareIndex = null;
            validDestinations = [];
            notifyListeners();
            return;
          }
        }
      }

      if (piece != null && piece.color == engine.activeColor) {
        selectedSquareIndex = index;
        validDestinations = engine.getLegalDestinations(index);
        notifyListeners();
        return;
      }

      selectedSquareIndex = null;
      validDestinations = [];
      notifyListeners();
      return;
    }

    if (piece != null && piece.color == engine.activeColor) {
      selectedSquareIndex = index;
      validDestinations = engine.getLegalDestinations(index);
      notifyListeners();
    }
  }

  void _playOpponentPuzzleReply() {
    if (currentMoveIndex >= currentPuzzle!.moves.length) return;

    Future.delayed(const Duration(milliseconds: 500), () {
      final replyUci = currentPuzzle!.moves[currentMoveIndex];
      if (replyUci.length >= 4) {
        final from = replyUci.substring(0, 2);
        final to = replyUci.substring(2, 4);
        engine.makeMove(from, to);
        currentMoveIndex++;
        if (currentMoveIndex >= currentPuzzle!.moves.length) {
          isSolved = true;
          _puzzleService.submitAttempt(currentPuzzle!.id, true, 25);
        }
        notifyListeners();
      }
    });
  }

  void resetPuzzle() {
    if (currentPuzzle == null) return;
    engine = ChessEngine(currentPuzzle!.fen);
    currentMoveIndex = 0;
    isSolved = false;
    isFailed = false;
    selectedSquareIndex = null;
    validDestinations = [];
    notifyListeners();
  }
}
