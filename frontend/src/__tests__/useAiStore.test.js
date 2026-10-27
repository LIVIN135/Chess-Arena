import './setup';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAiStore } from '../store/useAiStore';
import { gameService } from '../services/gameService';
import { useAuthStore } from '../store/useAuthStore';
import { Chess } from 'chess.js';

vi.mock('../services/gameService', () => ({
  gameService: {
    createGame: vi.fn().mockResolvedValue({ id: 'saved-ai-game' }),
    recordMove: vi.fn(),
  },
}));

vi.mock('../utils/chessAudio', () => ({
  chessAudio: {
    playMove: vi.fn(),
    playCapture: vi.fn(),
    playCheck: vi.fn(),
    playGameOver: vi.fn(),
  },
}));

describe('useAiStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('resets in-flight move calculations when resetToSetup is called', () => {
    const store = useAiStore.getState();

    // Start in playing status
    useAiStore.setState({
      status: 'PLAYING',
      isThinking: true,
      gameToken: 42,
    });

    store.resetToSetup();

    const state = useAiStore.getState();
    expect(state.status).toBe('SETUP');
    expect(state.isThinking).toBe(false);
    expect(state.gameToken).toBeGreaterThan(42);
  });

  it('allows piece movement via makePlayerMove and updates game state', () => {
    const freshGame = new Chess();
    useAiStore.setState({
      status: 'PLAYING',
      isThinking: false,
      turn: 'w',
      assignedPlayerColor: 'white',
      gameInstance: freshGame,
      fen: freshGame.fen(),
      history: [],
      lastMove: null,
    });

    const store = useAiStore.getState();
    expect(store.canMakeMove()).toBe(true);

    // Make opening move 1. e4
    const success = store.makePlayerMove({ from: 'e2', to: 'e4', promotion: 'q' });
    expect(success).toBe(true);

    const updatedState = useAiStore.getState();
    expect(updatedState.history.length).toBe(1);
    expect(updatedState.history[0].san).toBe('e4');
    expect(updatedState.lastMove).toEqual({ from: 'e2', to: 'e4' });
    expect(updatedState.turn).toBe('b');
  });

  it('blocks moves when isThinking is true or not the player turn', () => {
    const freshGame = new Chess();
    useAiStore.setState({
      status: 'PLAYING',
      isThinking: true, // Bot currently calculating
      turn: 'w',
      assignedPlayerColor: 'white',
      gameInstance: freshGame,
      fen: freshGame.fen(),
    });

    const store = useAiStore.getState();
    expect(store.canMakeMove()).toBe(false);

    const success = store.makePlayerMove({ from: 'e2', to: 'e4' });
    expect(success).toBe(false);
  });

  it('returns legal moves for selected piece on board', () => {
    const freshGame = new Chess();
    useAiStore.setState({
      status: 'PLAYING',
      gameInstance: freshGame,
    });

    const store = useAiStore.getState();
    const legalE2Moves = store.getLegalMoves('e2');
    expect(legalE2Moves).toContain('e3');
    expect(legalE2Moves).toContain('e4');
    expect(legalE2Moves.length).toBe(2);
  });

  it('keeps guest play in-memory without calling gameService upon game over', async () => {
    // Unauthenticated guest user
    useAuthStore.setState({
      isAuthenticated: false,
      user: null,
    });

    useAiStore.setState({
      status: 'PLAYING',
      history: [{ san: 'e4' }],
      assignedPlayerColor: 'white',
      gameInstance: new Chess(),
    });

    await useAiStore.getState().resign();

    const state = useAiStore.getState();
    expect(state.status).toBe('GAME_OVER');
    expect(state.winner).toBe('Black');

    // Guests should NEVER create a game in DB
    expect(gameService.createGame).not.toHaveBeenCalled();
  });

  it('saves game once at game end if authenticated, and never calls recordMove', async () => {
    // Set authenticated user
    useAuthStore.setState({
      isAuthenticated: true,
      user: { username: 'testuser' },
    });

    useAiStore.setState({
      status: 'PLAYING',
      history: [{ san: 'e4' }, { san: 'e5' }],
      assignedPlayerColor: 'white',
      gameInstance: new Chess(),
    });

    // Resign triggers game conclusion
    await useAiStore.getState().resign();

    const state = useAiStore.getState();
    expect(state.status).toBe('GAME_OVER');

    // Verify gameService.createGame was called exactly once
    expect(gameService.createGame).toHaveBeenCalledTimes(1);

    // Verify deprecated recordMove was NEVER called
    expect(gameService.recordMove).toHaveBeenCalledTimes(0);
  });
});
