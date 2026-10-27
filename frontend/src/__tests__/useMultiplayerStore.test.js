import './setup';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMultiplayerStore } from '../store/useMultiplayerStore';
import { wsService } from '../services/websocketService';

vi.mock('../services/websocketService', () => ({
  wsService: {
    connect: vi.fn(),
    disconnect: vi.fn(),
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
    send: vi.fn(),
    sendDirect: vi.fn(),
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

describe('useMultiplayerStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reconciles FEN and PGN on incoming MOVE_MADE event without sending /end', () => {
    const store = useMultiplayerStore.getState();

    // Setup initial game state
    useMultiplayerStore.setState({
      gameId: 'test-game-123',
      status: 'PLAYING',
      playerColor: 'black',
      turn: 'w',
    });

    // Simulate incoming MOVE_MADE event from server
    store.handleGameEvent({
      type: 'MOVE_MADE',
      lastMoveFrom: 'e2',
      lastMoveTo: 'e4',
      nextTurn: 'b',
      whiteTimeMs: 295000,
      blackTimeMs: 300000,
    });

    const state = useMultiplayerStore.getState();
    expect(state.turn).toBe('b');
    expect(state.fen).toContain('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR');
    expect(state.history.length).toBe(1);

    // Verify /end is never dispatched
    const sendCalls = wsService.send.mock.calls;
    const endCalls = sendCalls.filter(([dest]) => dest && dest.includes('/end'));
    expect(endCalls.length).toBe(0);
  });

  it('handles leaveGame cleanly without sending /end', () => {
    useMultiplayerStore.setState({
      gameId: 'test-game-123',
      status: 'GAME_OVER',
    });

    useMultiplayerStore.getState().leaveGame();

    const state = useMultiplayerStore.getState();
    expect(state.status).toBe('IDLE');
    expect(state.gameId).toBe(null);

    // Verify wsService.send was NOT called with /end
    const sendCalls = wsService.send.mock.calls;
    const endCalls = sendCalls.filter(([dest]) => dest && dest.includes('/end'));
    expect(endCalls.length).toBe(0);
  });
});
