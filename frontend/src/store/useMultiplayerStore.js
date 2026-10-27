import { create } from 'zustand';
import { Chess } from 'chess.js';
import { wsService } from '../services/websocketService';
import { chessAudio } from '../utils/chessAudio';
import { useAuthStore } from './useAuthStore';

export const getOrGeneratePlayerInfo = () => {
  const authUser = useAuthStore.getState().user;
  if (authUser && authUser.username) {
    return { id: authUser.username, name: authUser.username, guestId: null };
  }
  let guestId = localStorage.getItem('chess_arena_guest_id');
  if (!guestId || !/^guest_[a-z0-9]{7}$/.test(guestId)) {
    guestId = 'guest_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('chess_arena_guest_id', guestId);
  }
  return { id: guestId, name: `Player_${guestId.substring(6)}`, guestId };
};

const parseTimeToMs = (tc) => {
  if (!tc) return 300000;
  if (tc === '1m') return 60000;
  if (tc === '3m') return 180000;
  if (tc === '5m') return 300000;
  if (tc === '10m') return 600000;
  return 300000;
};

export const useMultiplayerStore = create((set, get) => {
  return {
    // Identity & Connection
    playerId: null,
    playerName: 'Player',
    isConnected: false,

    // Matchmaking State
    status: 'IDLE', // 'IDLE' | 'SEARCHING' | 'PLAYING' | 'GAME_OVER'
    selectedTimeControl: '5m',
    searchSeconds: 0,

    // Game Room State
    gameId: null,
    playerColor: 'white', // 'white' or 'black'
    opponentName: 'Opponent',
    timeControl: '5m',
    gameInstance: new Chess(),
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    turn: 'w',
    isCheck: false,
    history: [],
    lastMove: null,
    whiteTimeMs: 300000,
    blackTimeMs: 300000,
    lastTickTimestamp: null,

    // Outcome & Interactions
    winner: null,
    terminationReason: null,
    drawOfferReceived: false,
    drawOfferSent: false,
    pendingPromotion: null,

    // Connect to WebSocket STOMP
    initConnection: () => {
      const token = useAuthStore.getState().token;
      const playerInfo = getOrGeneratePlayerInfo();
      set({ playerId: playerInfo.id, playerName: playerInfo.name });

      wsService.connect(
        token,
        playerInfo.guestId,
        () => {
          set({ isConnected: true });
          // Subscribe to private player match notifications
          wsService.subscribe('/user/queue/match', (matchData) => {
            get().handleMatchFound(matchData);
          });
        },
        (error) => {
          console.error('STOMP connection error:', error);
          set({ isConnected: false });
        }
      );
    },

    // Start Searching for an Online Opponent
    startSearch: (timeControl = '5m') => {
      get().initConnection();
      const playerInfo = getOrGeneratePlayerInfo();

      set({
        playerId: playerInfo.id,
        playerName: playerInfo.name,
        status: 'SEARCHING',
        selectedTimeControl: timeControl,
        searchSeconds: 0,
        drawOfferReceived: false,
        drawOfferSent: false,
      });

      // Send join matchmaking request (derive identity from principal server-side)
      wsService.send('/app/matchmaking/join', {
        timeControl,
        playerName: playerInfo.name,
      });
    },

    cancelSearch: () => {
      wsService.send('/app/matchmaking/leave', {});
      set({ status: 'IDLE', searchSeconds: 0 });
    },

    incrementSearchSeconds: () => {
      set((state) => ({ searchSeconds: state.searchSeconds + 1 }));
    },

    // Handle Match Found (also used for reconnects)
    handleMatchFound: (matchData) => {
      const game = new Chess();
      if (matchData.pgn) {
        try {
          game.loadPgn(matchData.pgn);
        } catch {
          if (matchData.fen) game.load(matchData.fen);
        }
      } else if (matchData.fen) {
        try {
          game.load(matchData.fen);
        } catch {
          // fallback starting
        }
      }

      const initialMs = parseTimeToMs(matchData.timeControl);
      const isCheck = game.inCheck ? game.inCheck() : game.isCheck();

      set({
        status: 'PLAYING',
        gameId: matchData.gameId,
        playerColor: matchData.assignedColor,
        opponentName: matchData.opponentName,
        timeControl: matchData.timeControl,
        gameInstance: game,
        fen: game.fen(),
        turn: game.turn(),
        isCheck,
        history: game.history({ verbose: true }),
        lastMove: null,
        whiteTimeMs: matchData.whiteTimeMs ?? initialMs,
        blackTimeMs: matchData.blackTimeMs ?? initialMs,
        lastTickTimestamp: Date.now(),
        winner: null,
        terminationReason: null,
        drawOfferReceived: false,
        drawOfferSent: false,
      });

      chessAudio.playGameStart();

      // Subscribe to the game room topic
      wsService.subscribe(`/topic/game/${matchData.gameId}`, (event) => {
        get().handleGameEvent(event);
      });
    },

    // Handle Room Events
    handleGameEvent: (event) => {
      const { type } = event;
      const { playerColor, gameInstance } = get();

      if (type === 'MOVE_MADE') {
        const { lastMoveFrom, lastMoveTo, nextTurn, whiteTimeMs, blackTimeMs } = event;

        // If turn after move is 'b', white made the move. If turn is 'w', black made the move.
        const moverColor = (nextTurn === 'b' || event.turn === 'b') ? 'white' : 'black';
        const isMyMove = (moverColor === playerColor);

        if (isMyMove) {
          // Only reconcile clocks — do not duplicate move in history
          set({
            whiteTimeMs: whiteTimeMs != null ? whiteTimeMs : get().whiteTimeMs,
            blackTimeMs: blackTimeMs != null ? blackTimeMs : get().blackTimeMs,
            lastTickTimestamp: Date.now(),
          });
          return;
        }

        // Opponent's move: execute locally
        try {
          const moveRes = gameInstance.move({
            from: lastMoveFrom,
            to: lastMoveTo,
            promotion: 'q',
          });

          if (moveRes) {
            const isCheck = gameInstance.inCheck ? gameInstance.inCheck() : gameInstance.isCheck();
            if (moveRes.captured) {
              chessAudio.playCapture();
            } else if (isCheck) {
              chessAudio.playCheck();
            } else {
              chessAudio.playMove();
            }

            set({
              fen: gameInstance.fen(),
              turn: gameInstance.turn(),
              isCheck,
              history: gameInstance.history({ verbose: true }),
              lastMove: { from: lastMoveFrom, to: lastMoveTo },
              whiteTimeMs: whiteTimeMs != null ? whiteTimeMs : get().whiteTimeMs,
              blackTimeMs: blackTimeMs != null ? blackTimeMs : get().blackTimeMs,
              lastTickTimestamp: Date.now(),
              drawOfferReceived: false,
            });
          }
        } catch (e) {
          console.error('Failed to apply opponent move:', e);
        }
      } else if (type === 'GAME_END') {
        const { winner, reason, fen } = event;
        chessAudio.playGameOver();
        set({
          status: 'GAME_OVER',
          winner,
          terminationReason: reason,
          fen: fen || get().fen,
        });
      } else if (type === 'DRAW_OFFER') {
        const { fromColor } = event;
        if (fromColor !== playerColor) {
          set({ drawOfferReceived: true });
        }
      } else if (type === 'DRAW_DECLINED') {
        set({ drawOfferSent: false });
      }
    },

    canMakeMove: () => {
      const { status, turn, playerColor } = get();
      if (status !== 'PLAYING') return false;
      const expectedTurn = playerColor === 'white' ? 'w' : 'b';
      return turn === expectedTurn;
    },

    isPromotionMove: (from, to) => {
      const { gameInstance, playerColor } = get();
      const piece = gameInstance.get(from);
      if (!piece || piece.type !== 'p') return false;

      if (playerColor === 'white' && from[1] === '7' && to[1] === '8') {
        const moves = gameInstance.moves({ square: from, verbose: true });
        return moves.some((m) => m.to === to && m.promotion);
      }
      if (playerColor === 'black' && from[1] === '2' && to[1] === '1') {
        const moves = gameInstance.moves({ square: from, verbose: true });
        return moves.some((m) => m.to === to && m.promotion);
      }
      return false;
    },

    setPendingPromotion: (promotion) => set({ pendingPromotion: promotion }),
    cancelPromotion: () => set({ pendingPromotion: null }),

    makeMove: ({ from, to, promotion = 'q' }) => {
      const { gameInstance, canMakeMove, gameId } = get();
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

        set({
          fen: gameInstance.fen(),
          turn: gameInstance.turn(),
          isCheck,
          lastMove: { from, to },
          pendingPromotion: null,
          history: gameInstance.history({ verbose: true }),
          lastTickTimestamp: Date.now(),
        });

        // Send to server (server decides all results and moves)
        wsService.send(`/app/game/${gameId}/move`, {
          from,
          to,
          san: moveResult.san,
          promotion,
        });

        return true;
      } catch (e) {
        return false;
      }
    },

    resign: () => {
      const { gameId, status } = get();
      if (status !== 'PLAYING') return;
      wsService.send(`/app/game/${gameId}/resign`, {});
    },

    offerDraw: () => {
      const { gameId, status, drawOfferSent } = get();
      if (status !== 'PLAYING' || drawOfferSent) return;
      set({ drawOfferSent: true });
      wsService.send(`/app/game/${gameId}/draw-offer`, {});
    },

    acceptDraw: () => {
      const { gameId } = get();
      wsService.send(`/app/game/${gameId}/draw-accept`, {});
      set({ drawOfferReceived: false });
    },

    declineDraw: () => {
      const { gameId } = get();
      wsService.send(`/app/game/${gameId}/draw-decline`, {});
      set({ drawOfferReceived: false });
    },

    tickClock: () => {
      const { status, turn, whiteTimeMs, blackTimeMs, lastTickTimestamp } = get();
      if (status !== 'PLAYING') return;

      const now = Date.now();
      const delta = lastTickTimestamp ? now - lastTickTimestamp : 100;

      if (turn === 'w') {
        const nextTime = Math.max(0, whiteTimeMs - delta);
        set({ whiteTimeMs: nextTime, lastTickTimestamp: now });
      } else {
        const nextTime = Math.max(0, blackTimeMs - delta);
        set({ blackTimeMs: nextTime, lastTickTimestamp: now });
      }
    },

    leaveGame: () => {
      const { gameId } = get();
      if (gameId) {
        wsService.unsubscribe(`/topic/game/${gameId}`);
      }
      set({
        status: 'IDLE',
        gameId: null,
        winner: null,
        terminationReason: null,
        history: [],
        lastMove: null,
        drawOfferReceived: false,
        drawOfferSent: false,
        pendingPromotion: null,
      });
    },

    getLegalMoves: (square) => {
      const { gameInstance, status } = get();
      if (status !== 'PLAYING' || !square) return [];
      const moves = gameInstance.moves({ square, verbose: true });
      return moves.map((m) => m.to);
    },
  };
});
