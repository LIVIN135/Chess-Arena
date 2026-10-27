import { getClientBestMove, evaluatePosition } from '../utils/aiEngine';
import { Chess } from 'chess.js';

self.onmessage = (e) => {
  const { id, fen, difficulty } = e.data;
  try {
    const move = getClientBestMove(fen, difficulty);
    const chess = new Chess(fen);
    if (move && move.from && move.to) {
      try {
        chess.move({ from: move.from, to: move.to, promotion: move.promotion || 'q' });
      } catch {}
    }
    const evaluation = evaluatePosition(chess) / 100.0;
    self.postMessage({ id, move, evaluation, success: true });
  } catch (err) {
    self.postMessage({ id, error: err.message, success: false });
  }
};
