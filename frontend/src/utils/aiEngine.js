import { Chess } from 'chess.js';

// Piece weights (centipawns)
const PIECE_VALUES = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece-Square Tables (White's perspective, 8x8)
const PAWN_PST = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5, 5, 10, 25, 25, 10, 5, 5],
  [0, 0, 0, 20, 20, 0, 0, 0],
  [5, -5, -10, 0, 0, -10, -5, 5],
  [5, 10, 10, -20, -20, 10, 10, 5],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const KNIGHT_PST = [
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20, 0, 0, 0, 0, -20, -40],
  [-30, 0, 10, 15, 15, 10, 0, -30],
  [-30, 5, 15, 20, 20, 15, 5, -30],
  [-30, 0, 15, 20, 20, 15, 0, -30],
  [-30, 5, 10, 15, 15, 10, 5, -30],
  [-40, -20, 0, 5, 5, 0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50],
];

const BISHOP_PST = [
  [-20, -10, -10, -10, -10, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 10, 10, 5, 0, -10],
  [-10, 5, 5, 10, 10, 5, 5, -10],
  [-10, 0, 10, 10, 10, 10, 0, -10],
  [-10, 10, 10, 10, 10, 10, 10, -10],
  [-10, 5, 0, 0, 0, 0, 5, -10],
  [-20, -10, -10, -10, -10, -10, -10, -20],
];

const ROOK_PST = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [5, 10, 10, 10, 10, 10, 10, 5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [0, 0, 0, 5, 5, 0, 0, 0],
];

const QUEEN_PST = [
  [-20, -10, -10, -5, -5, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 5, 5, 5, 0, -10],
  [-5, 0, 5, 5, 5, 5, 0, -5],
  [0, 0, 5, 5, 5, 5, 0, -5],
  [-10, 5, 5, 5, 5, 5, 0, -10],
  [-10, 0, 5, 0, 0, 0, 0, -10],
  [-20, -10, -10, -5, -5, -10, -10, -20],
];

const KING_PST = [
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-20, -30, -30, -40, -40, -30, -30, -20],
  [-10, -20, -20, -20, -20, -20, -20, -10],
  [20, 20, 0, 0, 0, 0, 20, 20],
  [20, 30, 10, 0, 0, 10, 30, 20],
];

export const evaluatePosition = (chess) => {
  if (chess.isCheckmate()) {
    return chess.turn() === 'w' ? -30000 : 30000;
  }
  if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition()) {
    return 0;
  }

  const board = chess.board();
  let score = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const val = PIECE_VALUES[piece.type] || 0;
      let pstVal = 0;

      const rIndex = piece.color === 'w' ? r : 7 - r;
      if (piece.type === 'p') pstVal = PAWN_PST[rIndex][c];
      else if (piece.type === 'n') pstVal = KNIGHT_PST[rIndex][c];
      else if (piece.type === 'b') pstVal = BISHOP_PST[rIndex][c];
      else if (piece.type === 'r') pstVal = ROOK_PST[rIndex][c];
      else if (piece.type === 'q') pstVal = QUEEN_PST[rIndex][c];
      else if (piece.type === 'k') pstVal = KING_PST[rIndex][c];

      const total = val + pstVal;
      score += piece.color === 'w' ? total : -total;
    }
  }

  return score;
};

// Minimax with Alpha-Beta
const minimax = (chess, depth, alpha, beta, isMaximizing) => {
  if (depth === 0 || chess.isGameOver()) {
    return evaluatePosition(chess);
  }

  const moves = chess.moves({ verbose: true });
  // Move ordering: captures first
  moves.sort((a, b) => (b.captured ? 10 : 0) - (a.captured ? 10 : 0));

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      chess.move(move);
      const evalVal = minimax(chess, depth - 1, alpha, beta, false);
      chess.undo();
      maxEval = Math.max(maxEval, evalVal);
      alpha = Math.max(alpha, evalVal);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      chess.move(move);
      const evalVal = minimax(chess, depth - 1, alpha, beta, true);
      chess.undo();
      minEval = Math.min(minEval, evalVal);
      beta = Math.min(beta, evalVal);
      if (beta <= alpha) break;
    }
    return minEval;
  }
};

export const getClientBestMove = (fen, difficulty = 'INTERMEDIATE') => {
  const chess = new Chess(fen);
  const legalMoves = chess.moves({ verbose: true });
  if (legalMoves.length === 0) return null;

  const isWhite = chess.turn() === 'w';

  let depth = 2;
  let blunderRate = 0.1;

  switch (difficulty) {
    case 'NOVICE':
      depth = 1;
      blunderRate = 0.35;
      break;
    case 'INTERMEDIATE':
      depth = 2;
      blunderRate = 0.08;
      break;
    case 'ADVANCED':
      depth = 3;
      blunderRate = 0.02;
      break;
    case 'MASTER':
    default:
      depth = 3; // depth 3 in browser gives instant <100ms response
      blunderRate = 0.0;
      break;
  }

  // Blunder chance for beginner bots
  if (Math.random() < blunderRate && legalMoves.length > 1) {
    const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
    return {
      from: randomMove.from,
      to: randomMove.to,
      san: randomMove.san,
      promotion: randomMove.promotion || 'q',
      evaluation: 0.0,
      depth,
    };
  }

  // Order moves
  legalMoves.sort((a, b) => (b.captured ? 10 : 0) - (a.captured ? 10 : 0));

  let bestMove = legalMoves[0];
  let bestEval = isWhite ? -Infinity : Infinity;

  for (const move of legalMoves) {
    chess.move(move);
    const evalVal = minimax(chess, depth - 1, -Infinity, Infinity, !isWhite);
    chess.undo();

    if (isWhite) {
      if (evalVal > bestEval) {
        bestEval = evalVal;
        bestMove = move;
      }
    } else {
      if (evalVal < bestEval) {
        bestEval = evalVal;
        bestMove = move;
      }
    }
  }

  return {
    from: bestMove.from,
    to: bestMove.to,
    san: bestMove.san,
    promotion: bestMove.promotion || 'q',
    evaluation: bestEval / 100.0,
    depth,
  };
};
