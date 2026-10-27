import { create } from 'zustand';
import { Chess } from 'chess.js';
import { BOTS } from '../utils/bots';
import { getClientBestMove, evaluatePosition } from '../utils/aiEngine';
import { gameService } from '../services/gameService';
import { chessAudio } from '../utils/chessAudio';
import { useAuthStore } from './useAuthStore';

export const AI_TIME_CONTROLS = [
  { id: 'unlimited', name: 'No Clock', initialMs: null },
  { id: '3m', name: 'Blitz 3m', initialMs: 180000 },
  { id: '5m', name: 'Blitz 5m', initialMs: 300000 },
  { id: '10m', name: 'Rapid 10m', initialMs: 600000 },
];

let aiTimeoutId = null;
let aiWorkerInstance = null;

const getAiWorker = () => {
  if (typeof window === 'undefined' || typeof Worker === 'undefined') return null;
  if (!aiWorkerInstance) {
    try {
      aiWorkerInstance = new Worker(new URL('../workers/aiWorker.js', import.meta.url), { type: 'module' });
    } catch {
      aiWorkerInstance = null;
    }
  }
  return aiWorkerInstance;
};

const runAiCalculation = (fen, difficulty) => {
  return new Promise((resolve) => {
    let resolved = false;
    const worker = getAiWorker();
    if (!worker) {
      const move = getClientBestMove(fen, difficulty);
      const chess = new Chess(fen);
      if (move && move.from && move.to) {
        try {
          chess.move({ from: move.from, to: move.to, promotion: move.promotion || 'q' });
        } catch {}
      }
      const evaluation = evaluatePosition(chess) / 100.0;
      resolve({ move, evaluation });
      return;
    }

    const id = Math.random().toString(36).substring(2, 9);
    let timeoutId = null;

    const cleanup = () => {
      worker.removeEventListener('message', handler);
      worker.removeEventListener('error', errorHandler);
      if (timeoutId) clearTimeout(timeoutId);
    };

    const handler = (e) => {
      if (e.data?.id === id) {
        if (resolved) return;
        resolved = true;
        cleanup();
        if (e.data.success && e.data.move) {
          resolve({ move: e.data.move, evaluation: e.data.evaluation });
        } else {
          // Fallback to direct calculation
          const move = getClientBestMove(fen, difficulty);
          resolve({ move, evaluation: 0.0 });
        }
      }
    };

    const errorHandler = () => {
      if (resolved) return;
      resolved = true;
      cleanup();
      const move = getClientBestMove(fen, difficulty);
      resolve({ move, evaluation: 0.0 });
    };

    worker.addEventListener('message', handler);
    worker.addEventListener('error', errorHandler);
    worker.postMessage({ id, fen, difficulty });

    // Safety timeout
    timeoutId = setTimeout(() => {
      if (resolved) return;
      resolved = true;
      cleanup();
      const move = getClientBestMove(fen, difficulty);
      resolve({ move, evaluation: 0.0 });
    }, 1500);
  });
};

export const useAiStore = create((set, get) => {
  const defaultGame = new Chess();

  return {
    botList: BOTS,
    selectedBot: BOTS[1], // default Intermediate
    colorChoice: 'white', // 'white', 'black', 'random'
    assignedPlayerColor: 'white',
    timeControl: AI_TIME_CONTROLS[0], // unlimited by default
    gameToken: 0,

    status: 'SETUP', // 'SETUP' | 'PLAYING' | 'GAME_OVER'
    isThinking: false,
    gameInstance: defaultGame,
    fen: defaultGame.fen(),
    turn: 'w',
    isCheck: false,
    evaluation: 0.0,
    history: [],
    lastMove: null,
    winner: null,
    terminationReason: null,
    pendingPromotion: null,

    whiteTimeMs: null,
    blackTimeMs: null,
    lastTickTimestamp: null,

    loadBots: () => {
      set({
        botList: BOTS,
        selectedBot: get().selectedBot || BOTS[1],
      });
    },

    selectBot: (bot) => set({ selectedBot: bot }),
    setColorChoice: (colorChoice) => set({ colorChoice }),
    setTimeControl: (tc) => set({ timeControl: tc }),

    resetToSetup: () => {
      if (aiTimeoutId) {
        clearTimeout(aiTimeoutId);
        aiTimeoutId = null;
      }
      const currentToken = get().gameToken + 1;
      const game = new Chess();
      set({
        status: 'SETUP',
        gameToken: currentToken,
        isThinking: false,
        gameInstance: game,
        fen: game.fen(),
        turn: 'w',
        isCheck: false,
        evaluation: 0.0,
        history: [],
        lastMove: null,
        winner: null,
        terminationReason: null,
        pendingPromotion: null,
      });
    },

    startGame: () => {
      if (aiTimeoutId) {
        clearTimeout(aiTimeoutId);
        aiTimeoutId = null;
      }
      const currentToken = get().gameToken + 1;
      const { colorChoice, timeControl } = get();
      const newGame = new Chess();

      let playerColor = colorChoice;
      if (playerColor === 'random') {
        playerColor = Math.random() < 0.5 ? 'white' : 'black';
      }

      const initialMs = timeControl.initialMs;

      set({
        status: 'PLAYING',
        gameToken: currentToken,
        assignedPlayerColor: playerColor,
        gameInstance: newGame,
        fen: newGame.fen(),
        turn: 'w',
        isCheck: false,
        evaluation: 0.0,
        history: [],
        lastMove: null,
        winner: null,
        terminationReason: null,
        isThinking: false,
        pendingPromotion: null,
        whiteTimeMs: initialMs,
        blackTimeMs: initialMs,
        lastTickTimestamp: Date.now(),
      });

      // If player is Black, AI plays first move as White
      if (playerColor === 'black') {
        get().triggerAiMove(newGame);
      }
    },

    isPromotionMove: (from, to) => {
      const { gameInstance, assignedPlayerColor } = get();
      const piece = gameInstance.get(from);
      if (!piece || piece.type !== 'p') return false;

      if (assignedPlayerColor === 'white' && from[1] === '7' && to[1] === '8') {
        const moves = gameInstance.moves({ square: from, verbose: true });
        return moves.some((m) => m.to === to && m.promotion);
      }
      if (assignedPlayerColor === 'black' && from[1] === '2' && to[1] === '1') {
        const moves = gameInstance.moves({ square: from, verbose: true });
        return moves.some((m) => m.to === to && m.promotion);
      }
      return false;
    },

    setPendingPromotion: (promotion) => set({ pendingPromotion: promotion }),
    cancelPromotion: () => set({ pendingPromotion: null }),

    canMakeMove: () => {
      const { status, isThinking, turn, assignedPlayerColor } = get();
      if (status !== 'PLAYING' || isThinking) return false;
      const expectedTurn = assignedPlayerColor === 'white' ? 'w' : 'b';
      return turn === expectedTurn;
    },

    makeMove: ({ from, to, promotion = 'q' }) => {
      const { gameInstance, canMakeMove, assignedPlayerColor, history } = get();
      if (!canMakeMove()) return false;

      try {
        const moveResult = gameInstance.move({ from, to, promotion });
        if (!moveResult) return false;

        const isCheck = gameInstance.inCheck ? gameInstance.inCheck() : gameInstance.isCheck();
        if (gameInstance.isCheckmate() || gameInstance.isDraw()) {
          chessAudio.playGameOver();
        } else if (isCheck) {
          chessAudio.playCheck();
        } else if (moveResult.captured) {
          chessAudio.playCapture();
        } else {
          chessAudio.playMove();
        }

        const moveNumber = Math.floor(history.length / 2) + 1;
        const activeColor = assignedPlayerColor === 'white' ? 'w' : 'b';

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

        const evalScore = evaluatePosition(gameInstance) / 100.0;

        set({
          fen: gameInstance.fen(),
          turn: gameInstance.turn(),
          isCheck,
          history: newHistory,
          lastMove: { from, to },
          evaluation: evalScore,
          pendingPromotion: null,
          lastTickTimestamp: Date.now(),
        });

        // Check if game ended from player move
        if (gameInstance.isGameOver()) {
          get().handleGameOver(gameInstance, activeColor === 'w' ? 'White' : 'Black');
          return true;
        }

        // Trigger AI move response
        get().triggerAiMove(gameInstance);
        return true;
      } catch {
        return false;
      }
    },

    makePlayerMove: (args) => get().makeMove(args),

    triggerAiMove: async (instance = null) => {
      const chess = instance || get().gameInstance;
      const token = get().gameToken;
      const { selectedBot, assignedPlayerColor } = get();
      const botDifficulty = selectedBot ? selectedBot.id : 'INTERMEDIATE';

      if (aiTimeoutId) {
        clearTimeout(aiTimeoutId);
        aiTimeoutId = null;
      }

      set({ isThinking: true });

      // Artificial thinking delay reduced to 250-500 ms per Phase 3.3
      const delayMs = botDifficulty === 'NOVICE' ? 250 : botDifficulty === 'INTERMEDIATE' ? 350 : 450;

      aiTimeoutId = setTimeout(async () => {
        aiTimeoutId = null;
        // Guard against race conditions: token mismatch or game state changed
        if (get().gameToken !== token || get().status !== 'PLAYING') {
          return;
        }

        try {
          const { move: aiMove, evaluation } = await runAiCalculation(chess.fen(), botDifficulty);

          // Re-verify guard after async calculation
          if (get().gameToken !== token || get().status !== 'PLAYING') {
            return;
          }

          if (aiMove && aiMove.from && aiMove.to) {
            const moveResult = chess.move({
              from: aiMove.from,
              to: aiMove.to,
              promotion: aiMove.promotion || 'q',
            });

            if (moveResult) {
              const isCheck = chess.inCheck ? chess.inCheck() : chess.isCheck();
              if (chess.isCheckmate() || chess.isDraw()) {
                chessAudio.playGameOver();
              } else if (isCheck) {
                chessAudio.playCheck();
              } else if (moveResult.captured) {
                chessAudio.playCapture();
              } else {
                chessAudio.playMove();
              }

              const aiColor = assignedPlayerColor === 'white' ? 'b' : 'w';
              const moveNumber = Math.floor(get().history.length / 2) + 1;
              const newHistory = [
                ...get().history,
                {
                  moveNumber,
                  san: moveResult.san,
                  from: aiMove.from,
                  to: aiMove.to,
                  color: aiColor,
                  fen: chess.fen(),
                },
              ];

              set({
                fen: chess.fen(),
                turn: chess.turn(),
                isCheck,
                history: newHistory,
                lastMove: { from: aiMove.from, to: aiMove.to },
                evaluation: evaluation != null ? evaluation : evaluatePosition(chess) / 100.0,
                isThinking: false,
                lastTickTimestamp: Date.now(),
              });

              if (chess.isGameOver()) {
                get().handleGameOver(chess, aiColor === 'w' ? 'White' : 'Black');
              }
            } else {
              set({ isThinking: false });
            }
          } else {
            set({ isThinking: false });
          }
        } catch (e) {
          console.error('Error in AI execution:', e);
          if (get().gameToken === token) {
            set({ isThinking: false });
          }
        }
      }, delayMs);
    },

    takebackMove: () => {
      const { status, isThinking, gameInstance, history, assignedPlayerColor } = get();
      if (status !== 'PLAYING' || isThinking || history.length === 0) return;
      // Disable takeback when only the bot's first move exists (player is Black, history length 1)
      if (assignedPlayerColor === 'black' && history.length === 1) return;

      if (aiTimeoutId) {
        clearTimeout(aiTimeoutId);
        aiTimeoutId = null;
      }

      // Undo AI move and player move (2 plies)
      gameInstance.undo();
      if (history.length >= 2) {
        gameInstance.undo();
      }

      const newHistory = history.slice(0, Math.max(0, history.length - 2));
      const last = newHistory.length > 0 ? newHistory[newHistory.length - 1] : null;

      chessAudio.playMove();

      set({
        fen: gameInstance.fen(),
        turn: gameInstance.turn(),
        isCheck: gameInstance.inCheck ? gameInstance.inCheck() : gameInstance.isCheck(),
        history: newHistory,
        lastMove: last ? { from: last.from, to: last.to } : null,
        evaluation: evaluatePosition(gameInstance) / 100.0,
        isThinking: false,
      });
    },

    resign: () => {
      if (aiTimeoutId) {
        clearTimeout(aiTimeoutId);
        aiTimeoutId = null;
      }

      const { assignedPlayerColor, gameInstance } = get();
      const botWon = assignedPlayerColor === 'white' ? 'Black' : 'White';
      const reason = `${assignedPlayerColor === 'white' ? 'White' : 'Black'} Resigned`;

      chessAudio.playGameOver();

      set({
        status: 'GAME_OVER',
        winner: botWon,
        terminationReason: reason,
        isThinking: false,
      });

      // Single end game persistence for authenticated users
      get().persistFinishedGame(botWon, reason, gameInstance);
    },

    handleGameOver: (chess, lastMoverColor) => {
      if (aiTimeoutId) {
        clearTimeout(aiTimeoutId);
        aiTimeoutId = null;
      }

      let winner = null;
      let reason = 'Game Ended';

      if (chess.isCheckmate()) {
        winner = lastMoverColor;
        reason = 'Checkmate';
      } else if (chess.isStalemate()) {
        winner = 'Draw';
        reason = 'Stalemate';
      } else if (chess.isThreefoldRepetition()) {
        winner = 'Draw';
        reason = 'Threefold Repetition';
      } else if (chess.isInsufficientMaterial()) {
        winner = 'Draw';
        reason = 'Insufficient Material';
      } else if (chess.isDraw()) {
        winner = 'Draw';
        reason = 'Draw by 50-move rule';
      }

      set({
        status: 'GAME_OVER',
        winner,
        terminationReason: reason,
        isThinking: false,
      });

      get().persistFinishedGame(winner, reason, chess);
    },

    persistFinishedGame: async (winner, reason, chess) => {
      const authUser = useAuthStore.getState().user;
      if (!authUser) return; // Guests keep in memory / no network waste

      const { assignedPlayerColor, selectedBot, timeControl } = get();
      const botName = selectedBot ? `${selectedBot.name} (${selectedBot.difficulty})` : 'AI Bot';
      const whiteName = assignedPlayerColor === 'white' ? authUser.username : botName;
      const blackName = assignedPlayerColor === 'white' ? botName : authUser.username;

      const result = winner === 'White' ? 'WHITE_WINS' : winner === 'Black' ? 'BLACK_WINS' : 'DRAW';

      try {
        await gameService.createGame({
          whitePlayerName: whiteName,
          blackPlayerName: blackName,
          gameType: 'VS_AI',
          timeControl: timeControl.name,
          result,
          termination: reason,
          pgn: chess.pgn(),
          finalFen: chess.fen(),
        });
      } catch (err) {
        console.debug('Game save offline:', err.message);
      }
    },

    tickClock: () => {
      const { status, turn, whiteTimeMs, blackTimeMs, lastTickTimestamp, gameInstance } = get();
      if (status !== 'PLAYING' || whiteTimeMs == null || blackTimeMs == null) return;

      const now = Date.now();
      const delta = lastTickTimestamp ? now - lastTickTimestamp : 100;

      if (turn === 'w') {
        const nextTime = Math.max(0, whiteTimeMs - delta);
        if (nextTime <= 0) {
          set({ whiteTimeMs: 0, status: 'GAME_OVER', winner: 'Black', terminationReason: 'White Timeout' });
          get().persistFinishedGame('Black', 'White Timeout', gameInstance);
        } else {
          set({ whiteTimeMs: nextTime, lastTickTimestamp: now });
        }
      } else {
        const nextTime = Math.max(0, blackTimeMs - delta);
        if (nextTime <= 0) {
          set({ blackTimeMs: 0, status: 'GAME_OVER', winner: 'White', terminationReason: 'Black Timeout' });
          get().persistFinishedGame('White', 'Black Timeout', gameInstance);
        } else {
          set({ blackTimeMs: nextTime, lastTickTimestamp: now });
        }
      }
    },

    getLegalMoves: (square) => {
      const { gameInstance, status } = get();
      if (status !== 'PLAYING' || !square) return [];
      const moves = gameInstance.moves({ square, verbose: true });
      return moves.map((m) => m.to);
    },
  };
});
