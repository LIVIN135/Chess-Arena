import { create } from 'zustand';
import { Chess } from 'chess.js';
import { puzzleService } from '../services/puzzleService';

export const usePuzzleStore = create((set, get) => ({
  currentPuzzle: null,
  game: new Chess(),
  boardFen: 'start',
  currentMoveIndex: 0,
  status: 'idle', // 'idle' | 'playing' | 'correct_move' | 'solved' | 'failed'
  statusMessage: '',
  ratingChange: null,
  streak: 0,
  bestStreak: 0,
  userPuzzleRating: 1200,
  stats: {
    puzzleRating: 1200,
    puzzlesSolved: 0,
    puzzlesAttempted: 0,
    successRate: 0,
  },
  selectedTheme: 'all',
  selectedDifficulty: 'all', // 'casual' (800-1100), 'intermediate' (1100-1400), 'advanced' (1400+)
  isHintActive: false,
  hintSquare: null,
  solutionRevealed: false,
  isLoading: false,
  timeTakenSeconds: 0,

  setTheme: (theme) => set({ selectedTheme: theme }),
  setDifficulty: (diff) => set({ selectedDifficulty: diff }),

  fetchStats: async () => {
    try {
      const stats = await puzzleService.getStats();
      if (stats) {
        set({
          stats,
          userPuzzleRating: stats.puzzleRating || 1200,
        });
      }
    } catch {
      // ignore
    }
  },

  loadPuzzle: async (mode = 'random') => {
    set({ isLoading: true, status: 'idle', statusMessage: 'Loading puzzle...', isHintActive: false, hintSquare: null, solutionRevealed: false, ratingChange: null });
    try {
      const { selectedTheme, selectedDifficulty } = get();

      let targetRating = null;
      if (selectedDifficulty === 'casual') targetRating = 950;
      else if (selectedDifficulty === 'intermediate') targetRating = 1250;
      else if (selectedDifficulty === 'advanced') targetRating = 1400;

      const puzzle = mode === 'daily'
        ? await puzzleService.getDailyPuzzle()
        : await puzzleService.getRandomPuzzle(targetRating, selectedTheme);

      if (!puzzle) throw new Error('No puzzle received');

      // Initialize chess board from starting puzzle FEN
      const game = new Chess(puzzle.fen);

      // Play the initial opponent move if present
      if (puzzle.initialMove && puzzle.initialMove.length >= 4) {
        const from = puzzle.initialMove.slice(0, 2);
        const to = puzzle.initialMove.slice(2, 4);
        const promo = puzzle.initialMove.length > 4 ? puzzle.initialMove[4] : 'q';
        game.move({ from, to, promotion: promo });
      }

      const turnText = puzzle.playerColor === 'white' ? 'White' : 'Black';

      set({
        currentPuzzle: puzzle,
        game,
        boardFen: game.fen(),
        currentMoveIndex: 0,
        status: 'playing',
        statusMessage: `Your turn! Find the best move for ${turnText}.`,
        isLoading: false,
        timeTakenSeconds: 0,
      });
    } catch (err) {
      set({
        isLoading: false,
        status: 'failed',
        statusMessage: err.message || 'Failed to load puzzle',
      });
    }
  },

  makeMove: async (from, to, promotionPiece = 'q') => {
    const { game, currentPuzzle, currentMoveIndex, status, streak, bestStreak, solutionRevealed } = get();
    if (status === 'solved' || status === 'failed' || !currentPuzzle) return false;

    const expectedMoveUci = currentPuzzle.solutionMoves[currentMoveIndex];
    if (!expectedMoveUci) return false;

    // Check if player's move matches expected move
    const playerMoveUci = `${from}${to}`;
    const expectedFrom = expectedMoveUci.slice(0, 2);
    const expectedTo = expectedMoveUci.slice(2, 4);
    const expectedPromo = expectedMoveUci.length > 4 ? expectedMoveUci[4] : null;

    const isMatch = from === expectedFrom && to === expectedTo && (!expectedPromo || promotionPiece === expectedPromo);

    if (!isMatch) {
      // Incorrect move
      set({
        status: 'failed',
        statusMessage: 'Not the best move! Try again or view solution.',
        streak: 0,
      });

      // Submit failed attempt if not already revealed
      if (!solutionRevealed) {
        try {
          const res = await puzzleService.submitAttempt(currentPuzzle.id, false);
          if (res) {
            set((state) => ({
              ratingChange: res.ratingChange,
              userPuzzleRating: res.newUserRating,
              stats: {
                ...state.stats,
                puzzleRating: res.newUserRating,
                puzzlesAttempted: res.totalAttempted,
              },
            }));
          }
        } catch {
          // ignore
        }
      }
      return false;
    }

    // Correct move! Play it on the board
    try {
      const moveResult = game.move({ from, to, promotion: expectedPromo || promotionPiece });
      if (!moveResult) return false;
    } catch {
      return false;
    }

    const nextIndex = currentMoveIndex + 1;

    // Check if puzzle is fully solved!
    if (nextIndex >= currentPuzzle.solutionMoves.length) {
      const newStreak = streak + 1;
      const newBestStreak = Math.max(bestStreak, newStreak);

      set({
        game,
        boardFen: game.fen(),
        status: 'solved',
        statusMessage: `✓ Brilliant! Puzzle solved!`,
        streak: newStreak,
        bestStreak: newBestStreak,
        isHintActive: false,
        hintSquare: null,
      });

      // Submit solved attempt
      if (!solutionRevealed) {
        try {
          const res = await puzzleService.submitAttempt(currentPuzzle.id, true);
          if (res) {
            set((state) => ({
              ratingChange: res.ratingChange,
              userPuzzleRating: res.newUserRating,
              stats: {
                ...state.stats,
                puzzleRating: res.newUserRating,
                puzzlesSolved: res.totalSolved,
                puzzlesAttempted: res.totalAttempted,
                successRate: res.totalAttempted > 0
                  ? Math.round((res.totalSolved / res.totalAttempted) * 1000) / 10
                  : 100,
              },
            }));
          }
        } catch {
          // ignore
        }
      }

      return true;
    }

    // Opponent responds with next move
    const opponentMoveUci = currentPuzzle.solutionMoves[nextIndex];
    set({
      game,
      boardFen: game.fen(),
      currentMoveIndex: nextIndex + 1,
      status: 'correct_move',
      statusMessage: 'Best move! Waiting for opponent response...',
      isHintActive: false,
      hintSquare: null,
    });

    // Animate opponent response after 400ms delay
    setTimeout(() => {
      const oppFrom = opponentMoveUci.slice(0, 2);
      const oppTo = opponentMoveUci.slice(2, 4);
      const oppPromo = opponentMoveUci.length > 4 ? opponentMoveUci[4] : 'q';
      game.move({ from: oppFrom, to: oppTo, promotion: oppPromo });

      const turnText = currentPuzzle.playerColor === 'white' ? 'White' : 'Black';

      set({
        game,
        boardFen: game.fen(),
        status: 'playing',
        statusMessage: `Opponent responded. Find the next move for ${turnText}!`,
      });
    }, 450);

    return true;
  },

  requestHint: () => {
    const { currentPuzzle, currentMoveIndex } = get();
    if (!currentPuzzle) return;
    const expectedMove = currentPuzzle.solutionMoves[currentMoveIndex];
    if (expectedMove) {
      const hintSquare = expectedMove.slice(0, 2);
      set({
        isHintActive: true,
        hintSquare,
        statusMessage: `💡 Hint: Consider moving the piece on ${hintSquare.toUpperCase()}.`,
      });
    }
  },

  revealSolution: () => {
    const { currentPuzzle, game } = get();
    if (!currentPuzzle) return;

    // Reset game to after initialMove
    const newGame = new Chess(currentPuzzle.fen);
    if (currentPuzzle.initialMove && currentPuzzle.initialMove.length >= 4) {
      newGame.move({
        from: currentPuzzle.initialMove.slice(0, 2),
        to: currentPuzzle.initialMove.slice(2, 4),
        promotion: currentPuzzle.initialMove.length > 4 ? currentPuzzle.initialMove[4] : 'q',
      });
    }

    // Play all solution moves
    for (const uci of currentPuzzle.solutionMoves) {
      newGame.move({
        from: uci.slice(0, 2),
        to: uci.slice(2, 4),
        promotion: uci.length > 4 ? uci[4] : 'q',
      });
    }

    set({
      game: newGame,
      boardFen: newGame.fen(),
      status: 'failed',
      statusMessage: 'Solution revealed.',
      solutionRevealed: true,
      streak: 0,
      isHintActive: false,
      hintSquare: null,
    });
  },

  retryCurrentPuzzle: () => {
    const { currentPuzzle } = get();
    if (!currentPuzzle) return;

    const game = new Chess(currentPuzzle.fen);
    if (currentPuzzle.initialMove && currentPuzzle.initialMove.length >= 4) {
      game.move({
        from: currentPuzzle.initialMove.slice(0, 2),
        to: currentPuzzle.initialMove.slice(2, 4),
        promotion: currentPuzzle.initialMove.length > 4 ? currentPuzzle.initialMove[4] : 'q',
      });
    }

    const turnText = currentPuzzle.playerColor === 'white' ? 'White' : 'Black';

    set({
      game,
      boardFen: game.fen(),
      currentMoveIndex: 0,
      status: 'playing',
      statusMessage: `Your turn! Find the best move for ${turnText}.`,
      isHintActive: false,
      hintSquare: null,
    });
  },
}));
