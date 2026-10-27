import { create } from 'zustand';
import { analysisService } from '../services/analysisService';
import { chessAudio } from '../utils/chessAudio';

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const useAnalysisStore = create((set, get) => ({
  analysisData: null,
  isLoading: false,
  error: null,
  currentMoveIndex: -1, // -1 is starting board
  orientation: 'white',
  isPlayingAuto: false,

  // Load and analyze game by ID
  loadGameAnalysis: async (gameId) => {
    set({ isLoading: true, error: null, currentMoveIndex: -1, isPlayingAuto: false });
    try {
      let data = await analysisService.getGameAnalysis(gameId);
      if (!data || !data.moves || data.moves.length === 0) {
        data = await analysisService.analyzeGame(gameId);
      }
      set({ analysisData: data, isLoading: false, currentMoveIndex: -1 });
    } catch (err) {
      set({ error: err.response?.data?.message || err.message || 'Failed to analyze game', isLoading: false });
    }
  },

  // Analyze arbitrary PGN
  analyzePgn: (pgnString) => {
    set({ isLoading: true, error: null, currentMoveIndex: -1, isPlayingAuto: false });
    try {
      const data = analysisService.analyzePgnLocally(pgnString);
      set({ analysisData: data, isLoading: false, currentMoveIndex: -1 });
    } catch (err) {
      set({ error: err.message || 'Invalid PGN text', isLoading: false });
    }
  },

  // Navigation Stepper
  goToMove: (index) => {
    const { analysisData } = get();
    const maxIndex = analysisData && analysisData.moves ? analysisData.moves.length - 1 : -1;
    const clampedIndex = Math.max(-1, Math.min(maxIndex, index));

    chessAudio.playMove();
    set({ currentMoveIndex: clampedIndex });
  },

  nextMove: () => {
    const { currentMoveIndex, analysisData } = get();
    const maxIndex = analysisData && analysisData.moves ? analysisData.moves.length - 1 : -1;
    if (currentMoveIndex < maxIndex) {
      get().goToMove(currentMoveIndex + 1);
    } else {
      set({ isPlayingAuto: false });
    }
  },

  prevMove: () => {
    const { currentMoveIndex } = get();
    if (currentMoveIndex > -1) {
      get().goToMove(currentMoveIndex - 1);
    }
  },

  firstMove: () => get().goToMove(-1),

  lastMove: () => {
    const { analysisData } = get();
    const maxIndex = analysisData && analysisData.moves ? analysisData.moves.length - 1 : -1;
    get().goToMove(maxIndex);
  },

  flipBoard: () => set((s) => ({ orientation: s.orientation === 'white' ? 'black' : 'white' })),

  toggleAutoPlay: () => set((s) => ({ isPlayingAuto: !s.isPlayingAuto })),

  // Getters
  getCurrentFen: () => {
    const { analysisData, currentMoveIndex } = get();
    if (!analysisData || !analysisData.moves || currentMoveIndex < 0) {
      return START_FEN;
    }
    const move = analysisData.moves[currentMoveIndex];
    return move ? move.fenAfter : START_FEN;
  },

  getCurrentMove: () => {
    const { analysisData, currentMoveIndex } = get();
    if (!analysisData || !analysisData.moves || currentMoveIndex < 0) {
      return null;
    }
    return analysisData.moves[currentMoveIndex] || null;
  },
}));
