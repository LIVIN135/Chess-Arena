import api from './api';
import { Chess } from 'chess.js';
import { evaluatePosition, getClientBestMove } from '../utils/aiEngine';

export const analysisService = {
  // Analyze a game session recorded in PostgreSQL
  analyzeGame: async (gameId) => {
    const response = await api.post(`/analysis/game/${gameId}`);
    return response.data?.data;
  },

  // Retrieve existing game analysis from PostgreSQL
  getGameAnalysis: async (gameId) => {
    const response = await api.get(`/analysis/game/${gameId}`);
    return response.data?.data;
  },

  // Analyze arbitrary PGN locally and/or on backend
  analyzePgnLocally: (pgnString) => {
    const chess = new Chess();
    try {
      chess.loadPgn(pgnString);
    } catch (e) {
      throw new Error('Invalid PGN string format: ' + e.message);
    }

    const history = chess.history({ verbose: true });
    const analyzedMoves = [];
    const whiteCPLosses = [];
    const blackCPLosses = [];

    let whiteBlunders = 0, blackBlunders = 0;
    let whiteMistakes = 0, blackMistakes = 0;
    let whiteInaccuracies = 0, blackInaccuracies = 0;
    let whiteBestMoves = 0, blackBestMoves = 0;

    const replayChess = new Chess();

    for (let i = 0; i < history.length; i++) {
      const move = history[i];
      const fenBefore = replayChess.fen();
      const isWhite = move.color === 'w';

      // Engine best move before playing
      const engineBest = getClientBestMove(fenBefore, 'MASTER');
      const evalBefore = engineBest.evaluation;

      // Play the actual move
      replayChess.move(move);
      const fenAfter = replayChess.fen();

      // Evaluate after move
      const evalAfterObj = getClientBestMove(fenAfter, 'MASTER');
      const evalAfter = -evalAfterObj.evaluation;

      const cpDiff = Math.max(0.0, evalBefore - evalAfter);
      const cpLossCentipawns = cpDiff * 100.0;

      if (isWhite) {
        whiteCPLosses.add ? whiteCPLosses.add(cpLossCentipawns) : whiteCPLosses.push(cpLossCentipawns);
      } else {
        blackCPLosses.add ? blackCPLosses.add(cpLossCentipawns) : blackCPLosses.push(cpLossCentipawns);
      }

      let classification = 'GOOD';
      const isSameSan = move.san === engineBest.san;

      if (isSameSan || cpDiff <= 0.15) {
        classification = 'BEST';
        if (isWhite) whiteBestMoves++; else blackBestMoves++;
      } else if (cpDiff <= 0.45) {
        classification = 'GOOD';
      } else if (cpDiff <= 1.0) {
        classification = 'INACCURACY';
        if (isWhite) whiteInaccuracies++; else blackInaccuracies++;
      } else if (cpDiff <= 2.0) {
        classification = 'MISTAKE';
        if (isWhite) whiteMistakes++; else blackMistakes++;
      } else {
        classification = 'BLUNDER';
        if (isWhite) whiteBlunders++; else blackBlunders++;
      }

      const moveNumber = Math.floor(i / 2) + 1;

      analyzedMoves.push({
        moveNumber,
        color: move.color,
        san: move.san,
        from: move.from,
        to: move.to,
        fenBefore,
        fenAfter,
        evaluation: evalAfter,
        evalLoss: cpDiff,
        classification,
        bestMoveSan: engineBest.san,
        bestMoveFrom: engineBest.from,
        bestMoveTo: engineBest.to,
      });
    }

    const calcAccuracy = (losses) => {
      if (losses.length === 0) return 100.0;
      const totalAccuracy = losses.reduce((acc, loss) => {
        const capped = Math.min(600, Math.max(0, loss));
        return acc + 100 * Math.exp(-0.005 * capped);
      }, 0);
      return Math.round((totalAccuracy / losses.length) * 10) / 10;
    };

    const header = chess.header();

    return {
      gameId: null,
      whitePlayerName: header['White'] || 'White',
      blackPlayerName: header['Black'] || 'Black',
      whiteAccuracy: calcAccuracy(whiteCPLosses),
      blackAccuracy: calcAccuracy(blackCPLosses),
      whiteBlunders,
      blackBlunders,
      whiteMistakes,
      blackMistakes,
      whiteInaccuracies,
      blackInaccuracies,
      whiteBestMoves,
      blackBestMoves,
      moves: analyzedMoves,
      analyzedAt: new Date().toISOString(),
    };
  },
};

export default analysisService;
