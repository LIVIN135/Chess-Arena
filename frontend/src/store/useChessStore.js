import { create } from 'zustand';
import { Chess } from 'chess.js';
import { chessAudio } from '../utils/chessAudio';
import { gameService } from '../services/gameService';
import { useAuthStore } from './useAuthStore';

export const TIME_CONTROLS = [
  { id: '1m', name: 'Bullet 1m', initialMs: 60000, incrementMs: 0 },
  { id: '1|1', name: 'Bullet 1+1', initialMs: 60000, incrementMs: 1000 },
  { id: '3m', name: 'Blitz 3m', initialMs: 180000, incrementMs: 0 },
  { id: '3|2', name: 'Blitz 3+2', initialMs: 180000, incrementMs: 2000 },
  { id: '5m', name: 'Blitz 5m', initialMs: 300000, incrementMs: 0 },
  { id: '10m', name: 'Rapid 10m', initialMs: 600000, incrementMs: 0 },
  { id: 'unlimited', name: 'No Clock', initialMs: null, incrementMs: 0 },
];

const createInitialGame = () => new Chess();

export const useChessStore = create((set, get) => {
  const game = createInitialGame();
  const defaultTc = TIME_CONTROLS[5]; // 10 min rapid

  return {
    gameInstance: game,
    fen: game.fen(),
    turn: game.turn(), // 'w' or 'b'
    isCheck: game.inCheck(),
    isGameOver: game.isGameOver(),
    isCheckmate: game.isCheckmate(),
    isDraw: game.isDraw(),
    isStalemate: game.isStalemate(),
    winner: null,
    terminationReason: null,

    // Move history
    history: [],
    viewingIndex: null,
    lastMove: null,

    // Board settings
    orientation: 'white',
    pendingPromotion: null,

    // Clocks
    timeControl: defaultTc,
    whiteTimeMs: defaultTc.initialMs,
    blackTimeMs: defaultTc.initialMs,
    isClockRunning: false,
    lastTickTimestamp: null,

    persistFinishedGame: async (winner, reason) => {
      const authUser = useAuthStore.getState().user;
      if (!authUser) return; // Keep in memory for guests

      const { gameInstance, timeControl } = get();
      const result = winner === 'White' ? 'WHITE_WINS' : winner === 'Black' ? 'BLACK_WINS' : 'DRAW';

      try {
        await gameService.createGame({
          whitePlayerName: 'Player 1',
          blackPlayerName: 'Player 2',
          gameType: 'LOCAL_PASS_AND_PLAY',
          timeControl: timeControl.name,
          result,
          termination: reason,
          pgn: gameInstance.pgn(),
          finalFen: gameInstance.fen(),
        });
      } catch (err) {
        console.debug('Local game save offline:', err.message);
      }
    },

    // Make Move
    makeMove: ({ from, to, promotion = 'q' }) => {
      const {
        gameInstance,
        history,
        turn,
        timeControl,
        isGameOver,
      } = get();
      if (isGameOver) return false;

      try {
        const activeColor = turn;
        const moveResult = gameInstance.move({
          from,
          to,
          promotion,
        });

        if (!moveResult) return false;

        // Sound effect
        if (gameInstance.isCheckmate() || gameInstance.isDraw()) {
          chessAudio.playGameOver();
        } else if (gameInstance.inCheck()) {
          chessAudio.playCheck();
        } else if (moveResult.captured) {
          chessAudio.playCapture();
        } else {
          chessAudio.playMove();
        }

        const moveNumber = Math.floor(history.length / 2) + 1;
        const newHistory = [
          ...history,
          {
            moveNumber,
            san: moveResult.san,
            from,
            to,
            color: activeColor,
            fen: gameInstance.fen(),
          },
        ];

        // Increment clock if applicable
        let newWhiteTime = get().whiteTimeMs;
        let newBlackTime = get().blackTimeMs;
        if (timeControl.incrementMs > 0) {
          if (activeColor === 'w' && newWhiteTime !== null) {
            newWhiteTime += timeControl.incrementMs;
          } else if (activeColor === 'b' && newBlackTime !== null) {
            newBlackTime += timeControl.incrementMs;
          }
        }

        set({
          fen: gameInstance.fen(),
          turn: gameInstance.turn(),
          isCheck: gameInstance.inCheck(),
          isGameOver: gameInstance.isGameOver(),
          isCheckmate: gameInstance.isCheckmate(),
          isDraw: gameInstance.isDraw(),
          isStalemate: gameInstance.isStalemate(),
          history: newHistory,
          viewingIndex: null,
          lastMove: { from, to },
          pendingPromotion: null,
          whiteTimeMs: newWhiteTime,
          blackTimeMs: newBlackTime,
          isClockRunning: !gameInstance.isGameOver(),
          lastTickTimestamp: Date.now(),
        });

        // Determine if game is ended
        if (gameInstance.isGameOver()) {
          let winner = null;
          let terminationReason = 'Game Drawn';

          if (gameInstance.isCheckmate()) {
            winner = activeColor === 'w' ? 'White' : 'Black';
            terminationReason = 'Checkmate';
          } else if (gameInstance.isStalemate()) {
            terminationReason = 'Stalemate';
          } else if (gameInstance.isThreefoldRepetition()) {
            terminationReason = 'Threefold Repetition';
          } else if (gameInstance.isInsufficientMaterial()) {
            terminationReason = 'Insufficient Material';
          } else if (gameInstance.isDraw()) {
            terminationReason = '50-Move Rule';
          }

          set({ winner, terminationReason });
          get().persistFinishedGame(winner, terminationReason);
        }

        return true;
      } catch {
        return false;
      }
    },

    isPromotionMove: (from, to) => {
      const { gameInstance } = get();
      const piece = gameInstance.get(from);
      if (!piece || piece.type !== 'p') return false;

      if (piece.color === 'w' && from[1] === '7' && to[1] === '8') {
        const moves = gameInstance.moves({ square: from, verbose: true });
        return moves.some((m) => m.to === to && m.promotion);
      }

      if (piece.color === 'b' && from[1] === '2' && to[1] === '1') {
        const moves = gameInstance.moves({ square: from, verbose: true });
        return moves.some((m) => m.to === to && m.promotion);
      }

      return false;
    },

    setPendingPromotion: (promotion) => set({ pendingPromotion: promotion }),
    cancelPromotion: () => set({ pendingPromotion: null }),

    getLegalMoves: (square) => {
      const { gameInstance, isGameOver } = get();
      if (isGameOver || !square) return [];
      const moves = gameInstance.moves({ square, verbose: true });
      return moves.map((m) => m.to);
    },

    tickClock: () => {
      const {
        isClockRunning,
        turn,
        isGameOver,
        whiteTimeMs,
        blackTimeMs,
        lastTickTimestamp,
        timeControl,
      } = get();
      if (!isClockRunning || isGameOver || timeControl.initialMs === null) return;

      const now = Date.now();
      const delta = lastTickTimestamp ? now - lastTickTimestamp : 100;

      if (turn === 'w') {
        const newTime = Math.max(0, whiteTimeMs - delta);
        if (newTime <= 0) {
          chessAudio.playGameOver();
          set({
            whiteTimeMs: 0,
            isClockRunning: false,
            isGameOver: true,
            winner: 'Black',
            terminationReason: 'White Timeout',
          });
          get().persistFinishedGame('Black', 'White Timeout');
        } else {
          set({ whiteTimeMs: newTime, lastTickTimestamp: now });
        }
      } else {
        const newTime = Math.max(0, blackTimeMs - delta);
        if (newTime <= 0) {
          chessAudio.playGameOver();
          set({
            blackTimeMs: 0,
            isClockRunning: false,
            isGameOver: true,
            winner: 'White',
            terminationReason: 'Black Timeout',
          });
          get().persistFinishedGame('White', 'Black Timeout');
        } else {
          set({ blackTimeMs: newTime, lastTickTimestamp: now });
        }
      }
    },

    navigateToMove: (index) => {
      const { history, gameInstance } = get();
      if (index === null || index >= history.length - 1) {
        set({ viewingIndex: null, fen: gameInstance.fen() });
      } else if (index === -1) {
        set({
          viewingIndex: -1,
          fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        });
      } else if (index >= 0 && index < history.length) {
        set({ viewingIndex: index, fen: history[index].fen });
      }
    },

    flipBoard: () => {
      set((state) => ({
        orientation: state.orientation === 'white' ? 'black' : 'white',
      }));
    },

    resetGame: (newTc) => {
      const newGame = createInitialGame();
      const tc = newTc || get().timeControl;
      set({
        gameInstance: newGame,
        fen: newGame.fen(),
        turn: 'w',
        isCheck: false,
        isGameOver: false,
        isCheckmate: false,
        isDraw: false,
        isStalemate: false,
        winner: null,
        terminationReason: null,
        history: [],
        viewingIndex: null,
        lastMove: null,
        pendingPromotion: null,
        timeControl: tc,
        whiteTimeMs: tc.initialMs,
        blackTimeMs: tc.initialMs,
        isClockRunning: false,
        lastTickTimestamp: null,
      });
    },

    resign: (color) => {
      const winner = color === 'white' ? 'Black' : 'White';
      const reason = `${color === 'white' ? 'White' : 'Black'} Resigned`;

      chessAudio.playGameOver();
      set({
        isGameOver: true,
        winner,
        terminationReason: reason,
        isClockRunning: false,
      });

      get().persistFinishedGame(winner, reason);
    },

    offerDraw: () => {
      chessAudio.playGameOver();
      set({
        isGameOver: true,
        winner: 'Draw',
        terminationReason: 'Draw Agreed',
        isClockRunning: false,
      });

      get().persistFinishedGame('Draw', 'Draw Agreed');
    },

    getPGN: () => get().gameInstance.pgn(),
  };
});
