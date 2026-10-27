import 'dart:async';
import 'package:flutter/foundation.dart';
import '../engine/chess_engine.dart';
import '../models/chess_models.dart';

class GameProvider with ChangeNotifier {
  late ChessEngine engine;
  GameMode mode = GameMode.localPassAndPlay;

  int? selectedSquareIndex;
  List<int> validDestinations = [];
  int? lastMoveFromIndex;
  int? lastMoveToIndex;

  // Clocks in seconds
  int whiteTimeSeconds = 600;
  int blackTimeSeconds = 600;
  Timer? _timer;
  bool _isClockRunning = false;

  // AI settings
  int aiDifficulty = 2; // 1, 2, or 3
  bool isAiThinking = false;
  PieceColor humanColor = PieceColor.white;

  GameProvider() {
    initNewGame();
  }

  void initNewGame({
    GameMode newMode = GameMode.localPassAndPlay,
    int initialMinutes = 10,
    int difficulty = 2,
    PieceColor playerColor = PieceColor.white,
  }) {
    _stopClock();
    engine = ChessEngine();
    mode = newMode;
    aiDifficulty = difficulty;
    humanColor = playerColor;
    selectedSquareIndex = null;
    validDestinations = [];
    lastMoveFromIndex = null;
    lastMoveToIndex = null;

    whiteTimeSeconds = initialMinutes * 60;
    blackTimeSeconds = initialMinutes * 60;
    _isClockRunning = false;

    notifyListeners();

    if (mode == GameMode.vsAi && humanColor == PieceColor.black) {
      _triggerAiMove();
    }
  }

  void onSquareTapped(int index) {
    if (isAiThinking || engine.isGameOver) return;

    if (mode == GameMode.vsAi && engine.activeColor != humanColor) {
      return;
    }

    final piece = engine.pieceAt(index);

    // If already selected, check if tapped on valid destination
    if (selectedSquareIndex != null) {
      if (validDestinations.contains(index)) {
        final fromSq = ChessEngine.indexToSquare(selectedSquareIndex!);
        final toSq = ChessEngine.indexToSquare(index);

        final success = engine.makeMove(fromSq, toSq);
        if (success) {
          lastMoveFromIndex = selectedSquareIndex;
          lastMoveToIndex = index;
          selectedSquareIndex = null;
          validDestinations = [];

          if (!_isClockRunning) {
            _startClock();
          }

          notifyListeners();

          // If playing vs AI and game not over, trigger AI reply
          if (mode == GameMode.vsAi && !engine.isGameOver) {
            _triggerAiMove();
          }
          return;
        }
      }

      // Tap on own piece switches selection
      if (piece != null && piece.color == engine.activeColor) {
        selectedSquareIndex = index;
        validDestinations = engine.getLegalDestinations(index);
        notifyListeners();
        return;
      }

      // Deselect
      selectedSquareIndex = null;
      validDestinations = [];
      notifyListeners();
      return;
    }

    // Select piece if matching active color
    if (piece != null && piece.color == engine.activeColor) {
      selectedSquareIndex = index;
      validDestinations = engine.getLegalDestinations(index);
      notifyListeners();
    }
  }

  void _triggerAiMove() {
    isAiThinking = true;
    notifyListeners();

    // Async delay to let UI render and simulate calculation
    Future.delayed(const Duration(milliseconds: 600), () {
      final bestMove = engine.getBestMove(aiDifficulty);
      if (bestMove != null) {
        final from = ChessEngine.squareNameToIndex(bestMove.from);
        final to = ChessEngine.squareNameToIndex(bestMove.to);

        engine.makeMove(bestMove.from, bestMove.to);
        lastMoveFromIndex = from;
        lastMoveToIndex = to;
      }
      isAiThinking = false;
      notifyListeners();
    });
  }

  void _startClock() {
    _stopClock();
    _isClockRunning = true;
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (engine.isGameOver) {
        _stopClock();
        return;
      }

      if (engine.activeColor == PieceColor.white) {
        if (whiteTimeSeconds > 0) {
          whiteTimeSeconds--;
        } else {
          _stopClock();
        }
      } else {
        if (blackTimeSeconds > 0) {
          blackTimeSeconds--;
        } else {
          _stopClock();
        }
      }
      notifyListeners();
    });
  }

  void _stopClock() {
    _timer?.cancel();
    _timer = null;
    _isClockRunning = false;
  }

  void resign(PieceColor color) {
    _stopClock();
    notifyListeners();
  }

  @override
  void dispose() {
    _stopClock();
    super.dispose();
  }
}
