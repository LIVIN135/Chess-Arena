import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { gameService } from '../services/gameService';

export const GameHistoryPage = ({ onNavigateToPlay, onNavigateToAnalysis }) => {
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [copiedPgn, setCopiedPgn] = useState(false);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await gameService.getGameHistory();
      setGames(data);
    } catch (err) {
      setError(err.message || 'Failed to load match history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleInspect = async (gameId) => {
    try {
      const fullGame = await gameService.getGameById(gameId);
      setSelectedGame(fullGame);
    } catch (err) {
      alert('Failed to load game details: ' + err.message);
    }
  };

  const getResultBadge = (result) => {
    switch (result) {
      case 'WHITE_WINS':
        return <Badge variant="success">White Won</Badge>;
      case 'BLACK_WINS':
        return <Badge variant="neutral">Black Won</Badge>;
      case 'DRAW':
        return <Badge variant="info">Draw</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="warning" dot>Live</Badge>;
      default:
        return <Badge variant="neutral">{result}</Badge>;
    }
  };

  const copyPgn = (pgn) => {
    navigator.clipboard.writeText(pgn || '');
    setCopiedPgn(true);
    setTimeout(() => setCopiedPgn(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#262c3b] pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>📜</span> Game History &amp; Archives
          </h1>
          <p className="text-xs text-gray-400">
            Past matches and notation logs stored permanently in PostgreSQL 18
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchHistory}
            isLoading={isLoading}
            className="text-xs"
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onNavigateToPlay}
            className="text-xs"
          >
            ♟️ Play New Game
          </Button>
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="py-16 text-center text-gray-400 animate-pulse">
          Loading game archives from PostgreSQL...
        </div>
      ) : error ? (
        <Card elevated className="border-red-900/60 bg-red-950/30 text-red-300">
          <p className="font-semibold text-sm">Failed to load history</p>
          <p className="text-xs text-red-400 mt-1">{error}</p>
        </Card>
      ) : games.length === 0 ? (
        <Card elevated className="py-12 text-center space-y-3">
          <div className="text-3xl">♟️</div>
          <h3 className="text-base font-bold text-white">No games recorded yet</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Play a match in the Chess Arena to automatically record your moves and PGN history in PostgreSQL.
          </p>
          <div className="pt-2">
            <Button variant="primary" size="md" onClick={onNavigateToPlay}>
              Play First Game
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-[#262c3b] bg-[#151921]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#262c3b] bg-[#11141b] text-gray-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Players</th>
                  <th className="py-3 px-4">Type / Clock</th>
                  <th className="py-3 px-4">Result</th>
                  <th className="py-3 px-4">Moves</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2432] text-gray-200">
                {games.map((game) => (
                  <tr key={game.id} className="hover:bg-[#1c212c] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-white flex items-center gap-1.5">
                        <span className="text-gray-400">⚪</span> {game.whitePlayerName}
                        <span className="text-gray-500 font-normal">vs</span>
                        <span className="text-gray-400">⚫</span> {game.blackPlayerName}
                      </div>
                      {game.terminationReason && (
                        <span className="text-[10px] text-gray-400 block mt-0.5">
                          {game.terminationReason}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-300">{game.gameType}</div>
                      <span className="text-[10px] text-gray-400">{game.timeControl}</span>
                    </td>
                    <td className="py-3 px-4">{getResultBadge(game.result)}</td>
                    <td className="py-3 px-4 font-mono text-gray-300">
                      {game.movesCount} {game.movesCount === 1 ? 'ply' : 'plies'}
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      {new Date(game.startTime).toLocaleDateString()} {' '}
                      <span className="text-[10px] text-gray-400 block">
                        {new Date(game.startTime).toLocaleTimeString()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {onNavigateToAnalysis && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onNavigateToAnalysis(game.id)}
                            className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
                          >
                            Analyze
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleInspect(game.id)}
                          className="text-xs"
                        >
                          Inspect
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inspect Modal Dialog */}
      {selectedGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-[#262c3b] bg-[#151921] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#262c3b] pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  Match Details: {selectedGame.whitePlayerName} vs {selectedGame.blackPlayerName}
                </h3>
                <span className="text-xs text-gray-400">
                  UUID: {selectedGame.id}
                </span>
              </div>
              <button
                onClick={() => setSelectedGame(null)}
                className="text-gray-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-lg bg-[#0b0e14] border border-[#262c3b] p-3">
                <span className="text-gray-400 block text-[10px] uppercase">Result</span>
                <span className="font-bold text-emerald-400 mt-1 block">{selectedGame.result}</span>
              </div>
              <div className="rounded-lg bg-[#0b0e14] border border-[#262c3b] p-3">
                <span className="text-gray-400 block text-[10px] uppercase">Reason</span>
                <span className="font-semibold text-gray-200 mt-1 block">{selectedGame.terminationReason || 'Normal'}</span>
              </div>
              <div className="rounded-lg bg-[#0b0e14] border border-[#262c3b] p-3">
                <span className="text-gray-400 block text-[10px] uppercase">Format</span>
                <span className="font-semibold text-gray-200 mt-1 block">{selectedGame.gameType} ({selectedGame.timeControl})</span>
              </div>
              <div className="rounded-lg bg-[#0b0e14] border border-[#262c3b] p-3">
                <span className="text-gray-400 block text-[10px] uppercase">Total Plies</span>
                <span className="font-bold text-white mt-1 block">{selectedGame.moves?.length || 0}</span>
              </div>
            </div>

            {/* PGN Box */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-300">
                  PGN (Portable Game Notation)
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyPgn(selectedGame.pgn)}
                  className="text-xs text-[#7fa650]"
                >
                  {copiedPgn ? '✓ Copied' : 'Copy PGN'}
                </Button>
              </div>
              <pre className="p-3 rounded-lg bg-[#0b0e14] border border-[#262c3b] text-xs font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap max-h-48">
                {selectedGame.pgn || 'No PGN recorded'}
              </pre>
            </div>

            {/* Final FEN */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">
                Final Board Position (FEN)
              </label>
              <div className="p-2.5 rounded-lg bg-[#0b0e14] border border-[#262c3b] font-mono text-[11px] text-gray-400 truncate">
                {selectedGame.finalFen}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setSelectedGame(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
