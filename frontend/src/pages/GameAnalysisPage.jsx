import React, { useEffect, useState } from 'react';
import { AnalysisBoardView } from '../components/chess/AnalysisBoardView';
import { AnalysisMoveList } from '../components/chess/AnalysisMoveList';
import { EvaluationChart } from '../components/chess/EvaluationChart';
import { useAnalysisStore } from '../store/useAnalysisStore';
import { gameService } from '../services/gameService';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  BarChart2,
  FileText,
  History,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  XCircle,
  Loader2,
  Download,
} from 'lucide-react';
import { toast } from '../components/ui/Toast';

const SAMPLE_PGN = `[Event "Immortal Game"]
[Site "London"]
[Date "1851.06.21"]
[White "Adolf Anderssen"]
[Black "Lionel Kieseritzky"]
[Result "1-0"]

1. e4 e5 2. f4 exf4 3. Bc4 Qh4+ 4. Kf1 b5 5. Bxb5 Nf6 6. Nf3 Qh6 7. d3 Nh5 8. Nh4 Qg5 9. Nf5 c6 10. g4 Nf6 11. Rg1 cxb5 12. h4 Qg6 13. h5 Qg5 14. Qf3 Ng8 15. Bxf4 Qf6 16. Nc3 Bc5 17. Nd5 Qxb2 18. Bd6 Bxg1 19. e5 Qxa1+ 20. Ke2 Na6 21. Nxg7+ Kd8 22. Qf6+ Nxf6 23. Be7# 1-0`;

export const GameAnalysisPage = ({ initialGameId = null }) => {
  const {
    analysisData,
    isLoading,
    error,
    currentMoveIndex,
    isPlayingAuto,
    goToMove,
    nextMove,
    prevMove,
    firstMove,
    lastMove,
    flipBoard,
    toggleAutoPlay,
    loadGameAnalysis,
    analyzePgn,
    getCurrentMove,
  } = useAnalysisStore();

  const [activeTab, setActiveTab] = useState('review'); // 'review' | 'pgn' | 'matches'
  const [pgnInput, setPgnInput] = useState('');
  const [recentGames, setRecentGames] = useState([]);
  const [isLoadingGames, setIsLoadingGames] = useState(false);

  // Load initial game if passed via props or route
  useEffect(() => {
    if (initialGameId) {
      loadGameAnalysis(initialGameId);
    }
  }, [initialGameId, loadGameAnalysis]);

  // Fetch recent games list
  useEffect(() => {
    const fetchRecent = async () => {
      setIsLoadingGames(true);
      try {
        const games = await gameService.getRecentGames(10);
        setRecentGames(games || []);
      } catch (e) {
        console.debug('Failed to load recent matches:', e.message);
      } finally {
        setIsLoadingGames(false);
      }
    };
    fetchRecent();
  }, []);

  // Keyboard navigation (Left/Right arrow keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') prevMove();
      if (e.key === 'ArrowRight') nextMove();
      if (e.key === 'Home') firstMove();
      if (e.key === 'End') lastMove();
      if (e.key === ' ') {
        e.preventDefault();
        toggleAutoPlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevMove, nextMove, firstMove, lastMove, toggleAutoPlay]);

  // Auto-play timer
  useEffect(() => {
    if (!isPlayingAuto) return;
    const interval = setInterval(() => {
      nextMove();
    }, 1400);
    return () => clearInterval(interval);
  }, [isPlayingAuto, nextMove]);

  const currentMove = getCurrentMove();

  const handleAnalyzePgnSubmit = (e) => {
    e.preventDefault();
    if (!pgnInput.trim()) return;
    analyzePgn(pgnInput.trim());
    setActiveTab('review');
  };

  const handleSelectGame = (gameId) => {
    loadGameAnalysis(gameId);
    setActiveTab('review');
  };

  const handleExportPgn = () => {
    const pgnContent = analysisData?.pgn || pgnInput || SAMPLE_PGN;
    const blob = new Blob([pgnContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chess_arena_game_${Date.now()}.pgn`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('PGN downloaded successfully');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#262c3b] pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BarChart2 className="h-6 w-6 text-emerald-400" />
            <span>Game Review &amp; Analysis</span>
          </h1>
          <p className="text-xs text-gray-400">
            Deep engine review, move-by-move classification, CAPS accuracy, and tactical coaching
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPgn}
            className="px-3 py-1.5 rounded-lg border border-[#262c3b] bg-[#151921] hover:bg-[#1c212c] text-xs font-semibold text-gray-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Download game in PGN format"
          >
            <Download className="h-3.5 w-3.5 text-emerald-400" />
            <span>Export PGN</span>
          </button>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#151921] border border-[#262c3b]">
            <button
              onClick={() => setActiveTab('review')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'review'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Review Board
            </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
              activeTab === 'matches'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>Past Matches</span>
          </button>
          <button
            onClick={() => setActiveTab('pgn')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
              activeTab === 'pgn'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Import PGN</span>
          </button>
        </div>
        </div>
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="py-16 text-center space-y-3">
          <Loader2 className="h-8 w-8 text-emerald-400 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-white">Analyzing game positions with engine...</p>
          <p className="text-xs text-gray-400">Computing centipawn losses, classifications, and player accuracy</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* TAB 1: REVIEW BOARD */}
      {activeTab === 'review' && !isLoading && (
        <>
          {!analysisData ? (
            <div className="max-w-xl mx-auto py-12 text-center space-y-4 rounded-2xl bg-[#151921] border border-[#262c3b] p-8">
              <Sparkles className="h-10 w-10 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Game Loaded for Analysis</h3>
              <p className="text-xs text-gray-400">
                Choose a recorded game from your match history or import a PGN to generate a comprehensive accuracy review.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => setActiveTab('matches')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow cursor-pointer"
                >
                  Browse Past Matches
                </button>
                <button
                  onClick={() => {
                    analyzePgn(SAMPLE_PGN);
                  }}
                  className="px-4 py-2 bg-[#1c212c] hover:bg-[#252c3b] text-gray-200 text-xs font-semibold rounded-xl border border-[#262c3b] transition-all cursor-pointer"
                >
                  Load Famous Immortal Game
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Board, Stepper & Evaluation Graph (7 cols) */}
              <div className="lg:col-span-7 xl:col-span-7 space-y-4">
                {/* Match Header */}
                <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#151921] border border-[#262c3b]">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-white border border-gray-400" />
                    <span className="text-xs font-bold text-white">{analysisData.whitePlayerName}</span>
                  </div>
                  <span className="text-xs text-gray-500 font-bold">VS</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{analysisData.blackPlayerName}</span>
                    <span className="h-3 w-3 rounded-full bg-[#0b0e14] border border-gray-600" />
                  </div>
                </div>

                {/* Chessboard View */}
                <AnalysisBoardView />

                {/* Interactive Stepper Controls */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#151921] border border-[#262c3b]">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={firstMove}
                      className="p-2 rounded-lg bg-[#1c212c] hover:bg-[#252c3b] text-gray-300 transition-colors cursor-pointer"
                      title="First Move (Home)"
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={prevMove}
                      className="p-2 rounded-lg bg-[#1c212c] hover:bg-[#252c3b] text-gray-300 transition-colors cursor-pointer"
                      title="Previous Move (Left Arrow)"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={toggleAutoPlay}
                      className={`p-2 rounded-lg transition-colors cursor-pointer ${
                        isPlayingAuto
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#1c212c] hover:bg-[#252c3b] text-gray-300'
                      }`}
                      title="Auto-Play / Pause (Space)"
                    >
                      {isPlayingAuto ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={nextMove}
                      className="p-2 rounded-lg bg-[#1c212c] hover:bg-[#252c3b] text-gray-300 transition-colors cursor-pointer"
                      title="Next Move (Right Arrow)"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <button
                      onClick={lastMove}
                      className="p-2 rounded-lg bg-[#1c212c] hover:bg-[#252c3b] text-gray-300 transition-colors cursor-pointer"
                      title="Last Move (End)"
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </button>
                  </div>

                  <span className="font-mono text-xs text-gray-300">
                    {currentMoveIndex === -1
                      ? 'Starting Position'
                      : `Move ${Math.floor(currentMoveIndex / 2) + 1} (${currentMoveIndex + 1}/${
                          analysisData.moves.length
                        })`}
                  </span>

                  <button
                    onClick={flipBoard}
                    className="p-2 rounded-lg bg-[#1c212c] hover:bg-[#252c3b] text-gray-300 text-xs transition-colors cursor-pointer"
                    title="Flip Board"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>

                {/* Evaluation Graph */}
                <EvaluationChart />
              </div>

              {/* Right Column: Accuracy & Move Breakdown (5 cols) */}
              <div className="lg:col-span-5 xl:col-span-5 space-y-4">
                {/* Accuracy Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-[#151921] border border-[#262c3b] text-center space-y-1">
                    <span className="text-[11px] font-semibold text-gray-400 block uppercase tracking-wider">
                      White Accuracy
                    </span>
                    <span className="text-2xl font-black text-emerald-400 font-mono">
                      {analysisData.whiteAccuracy}%
                    </span>
                    <span className="text-[10px] text-gray-500 block truncate">
                      {analysisData.whitePlayerName}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#151921] border border-[#262c3b] text-center space-y-1">
                    <span className="text-[11px] font-semibold text-gray-400 block uppercase tracking-wider">
                      Black Accuracy
                    </span>
                    <span className="text-2xl font-black text-emerald-400 font-mono">
                      {analysisData.blackAccuracy}%
                    </span>
                    <span className="text-[10px] text-gray-500 block truncate">
                      {analysisData.blackPlayerName}
                    </span>
                  </div>
                </div>

                {/* Move Classification Breakdown */}
                <div className="p-4 rounded-xl bg-[#151921] border border-[#262c3b] space-y-3">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Move Classifications
                  </h3>

                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex items-center justify-between py-1 px-2 rounded bg-[#1c212c]/40">
                      <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Best Moves</span>
                      </span>
                      <span className="text-gray-300 font-bold">
                        {analysisData.whiteBestMoves} / {analysisData.blackBestMoves}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 px-2 rounded bg-[#1c212c]/40">
                      <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                        <HelpCircle className="h-3.5 w-3.5" />
                        <span>Inaccuracies</span>
                      </span>
                      <span className="text-gray-300 font-bold">
                        {analysisData.whiteInaccuracies} / {analysisData.blackInaccuracies}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 px-2 rounded bg-[#1c212c]/40">
                      <span className="flex items-center gap-1.5 text-orange-400 font-semibold">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>Mistakes</span>
                      </span>
                      <span className="text-gray-300 font-bold">
                        {analysisData.whiteMistakes} / {analysisData.blackMistakes}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 px-2 rounded bg-[#1c212c]/40">
                      <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Blunders</span>
                      </span>
                      <span className="text-rose-400 font-bold">
                        {analysisData.whiteBlunders} / {analysisData.blackBlunders}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Move Feedback / Coach Box */}
                {currentMove && (
                  <div className="p-4 rounded-xl bg-[#151921] border border-indigo-500/40 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <span>{currentMove.color === 'w' ? 'White' : 'Black'} played</span>
                        <span className="font-mono text-indigo-400 font-black text-sm">
                          {currentMove.san}
                        </span>
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                          currentMove.classification === 'BEST'
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                            : currentMove.classification === 'GOOD'
                            ? 'bg-green-950/60 text-green-300 border-green-800'
                            : currentMove.classification === 'INACCURACY'
                            ? 'bg-amber-950/60 text-amber-400 border-amber-800'
                            : currentMove.classification === 'MISTAKE'
                            ? 'bg-orange-950/60 text-orange-400 border-orange-800'
                            : 'bg-rose-950/60 text-rose-400 border-rose-800'
                        }`}
                      >
                        {currentMove.classification}
                      </span>
                    </div>

                    {currentMove.bestMoveSan && currentMove.bestMoveSan !== currentMove.san && (
                      <div className="p-2.5 rounded-lg bg-[#0b0e14] border border-[#262c3b] text-xs space-y-1">
                        <span className="text-[11px] text-gray-400 block">Engine Recommendation:</span>
                        <p className="font-mono text-emerald-400 font-bold">
                          Best was {currentMove.bestMoveSan} ({currentMove.bestMoveFrom} → {currentMove.bestMoveTo})
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Move Notation Table */}
                <div className="p-4 rounded-xl bg-[#151921] border border-[#262c3b] space-y-3">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Move List
                  </h3>
                  <AnalysisMoveList />
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* TAB 2: PAST MATCHES FROM DATABASE */}
      {activeTab === 'matches' && (
        <div className="max-w-3xl mx-auto py-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Select a Past Match to Analyze</h2>
            <span className="text-xs text-gray-400">Recorded in PostgreSQL</span>
          </div>

          {isLoadingGames ? (
            <div className="py-12 text-center text-gray-400 animate-pulse">Loading past matches...</div>
          ) : recentGames.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#151921] border border-[#262c3b] space-y-2 text-gray-400 text-xs">
              No completed matches found in database yet. Play a game vs Computer or Online first!
            </div>
          ) : (
            <div className="space-y-2">
              {recentGames.map((game) => (
                <div
                  key={game.id}
                  className="p-4 rounded-xl bg-[#151921] border border-[#262c3b] hover:border-[#384154] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        {game.whitePlayerName} vs {game.blackPlayerName}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#1c212c] text-emerald-400 font-semibold border border-[#262c3b]">
                        {game.result}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      {game.gameType} • {game.timeControl} • {game.totalMoves || 0} moves
                    </p>
                  </div>

                  <button
                    onClick={() => handleSelectGame(game.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-all shadow cursor-pointer self-end sm:self-center"
                  >
                    Analyze Game
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: IMPORT PGN */}
      {activeTab === 'pgn' && (
        <div className="max-w-2xl mx-auto py-6 space-y-4">
          <h2 className="text-lg font-bold text-white">Paste PGN Game String</h2>
          <p className="text-xs text-gray-400">
            Paste standard Portable Game Notation (PGN) text from Chess.com, Lichess, or your own studies
          </p>

          <form onSubmit={handleAnalyzePgnSubmit} className="space-y-4">
            <textarea
              rows={10}
              value={pgnInput}
              onChange={(e) => setPgnInput(e.target.value)}
              placeholder="Paste PGN here (e.g. 1. e4 e5 2. Nf3 Nc6...)"
              className="w-full p-4 rounded-xl bg-[#0b0e14] border border-[#262c3b] font-mono text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
            />

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setPgnInput(SAMPLE_PGN)}
                className="text-xs text-emerald-400 hover:underline cursor-pointer"
              >
                Insert Sample Immortal Game PGN
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer"
              >
                Start PGN Analysis
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
