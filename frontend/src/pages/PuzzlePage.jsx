import React, { useEffect, useState } from 'react';
import { usePuzzleStore } from '../store/usePuzzleStore';
import { useAuthStore } from '../store/useAuthStore';
import { PuzzleBoard } from '../components/puzzle/PuzzleBoard';
import { Button } from '../components/ui/Button';

export const PuzzlePage = ({ onNavigateToAuth }) => {
  const { user, isAuthenticated } = useAuthStore();
  const {
    currentPuzzle,
    status,
    statusMessage,
    ratingChange,
    streak,
    bestStreak,
    userPuzzleRating,
    stats,
    selectedTheme,
    selectedDifficulty,
    isLoading,
    loadPuzzle,
    requestHint,
    revealSolution,
    retryCurrentPuzzle,
    setTheme,
    setDifficulty,
    fetchStats,
  } = usePuzzleStore();

  const [activeTab, setActiveTab] = useState('trainer'); // 'trainer' | 'daily'

  useEffect(() => {
    loadPuzzle('random');
    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated, loadPuzzle, fetchStats]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'daily') {
      loadPuzzle('daily');
    } else {
      loadPuzzle('random');
    }
  };

  const handleNextPuzzle = () => {
    loadPuzzle(activeTab === 'daily' ? 'daily' : 'random');
  };

  const themesList = [
    { id: 'all', label: 'All Themes' },
    { id: 'mateIn1', label: 'Mate in 1' },
    { id: 'fork', label: 'Knight & Pawn Forks' },
    { id: 'pin', label: 'Pins' },
    { id: 'smotheredMate', label: 'Smothered Mate' },
    { id: 'sacrifice', label: 'Queen & Piece Sacs' },
    { id: 'opening', label: 'Opening Traps' },
    { id: 'endgame', label: 'Endgame Tactics' },
  ];

  const difficultyList = [
    { id: 'all', label: 'Any Rating' },
    { id: 'casual', label: 'Casual (800-1100)' },
    { id: 'intermediate', label: 'Intermediate (1100-1400)' },
    { id: 'advanced', label: 'Advanced (1400+)' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="mb-6 rounded-3xl border border-[#232b3d] bg-gradient-to-r from-[#121622] via-[#161c2c] to-[#0f131c] p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-2xl shadow-lg ring-4 ring-[#1f2638]">
              🧩
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black text-white">Tactical Chess Trainer</h1>
                <span className="rounded-full bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 text-xs font-bold text-purple-400">
                  Daily &amp; Rated Tactics
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Solve real tactical positions, build your streak, and sharpen your calculation.
              </p>
            </div>
          </div>

          {/* User Puzzle Stats Badge */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-[#1a2233] border border-[#273248] px-3.5 py-2">
              <span className="text-xs text-gray-400">Tactics Elo:</span>
              <span className="text-sm font-bold text-amber-400">
                {userPuzzleRating || 1200}
              </span>
              {ratingChange !== null && (
                <span className={`text-xs font-bold ${ratingChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  ({ratingChange >= 0 ? `+${ratingChange}` : ratingChange})
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-[#1a2233] border border-[#273248] px-3.5 py-2">
              <span className="text-xs text-gray-400">Streak:</span>
              <span className="text-sm font-bold text-orange-400 flex items-center gap-1">
                <span>🔥</span> {streak}
              </span>
              <span className="text-[10px] text-gray-500">
                (Best: {bestStreak})
              </span>
            </div>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="mt-5 pt-4 border-t border-[#1f2638] flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleTabChange('trainer')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'trainer'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-[#1a2130]'
            }`}
          >
            ⚡ Tactical Rush (Rated)
          </button>
          <button
            onClick={() => handleTabChange('daily')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'daily'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-[#1a2130]'
            }`}
          >
            ☀️ Daily Puzzle
          </button>
        </div>
      </div>

      {/* Main Puzzle Arena Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Chessboard */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <PuzzleBoard />

          {/* Turn indicator badge below board */}
          {currentPuzzle && (
            <div className="mt-4 flex items-center justify-between w-full max-w-[480px] sm:max-w-[520px] px-2 text-xs">
              <div className="flex items-center gap-2">
                <span className={`inline-block h-3 w-3 rounded-full ${
                  currentPuzzle.playerColor === 'white' ? 'bg-white border border-gray-400' : 'bg-black border border-gray-600'
                }`} />
                <span className="font-semibold text-gray-300">
                  Playing as {currentPuzzle.playerColor === 'white' ? 'White' : 'Black'}
                </span>
              </div>
              <span className="text-gray-400">
                Rating: <strong className="text-amber-400">{currentPuzzle.rating}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Right: Sidebar & Controls */}
        <div className="lg:col-span-5 space-y-4">
          {/* Status Alert Banner */}
          <div className={`rounded-2xl border p-4.5 transition-all shadow-md ${
            status === 'solved'
              ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
              : status === 'failed'
              ? 'border-red-500/40 bg-red-950/30 text-red-300'
              : status === 'correct_move'
              ? 'border-blue-500/40 bg-blue-950/30 text-blue-300'
              : 'border-[#263045] bg-[#141926] text-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {status === 'solved' ? '🎉' : status === 'failed' ? '❌' : status === 'correct_move' ? '👍' : '🎯'}
              </span>
              <div className="flex-1">
                <h3 className="font-bold text-sm">
                  {status === 'solved'
                    ? 'Puzzle Completed!'
                    : status === 'failed'
                    ? 'Incorrect Move'
                    : status === 'correct_move'
                    ? 'Best Move!'
                    : 'Find the Best Move'}
                </h3>
                <p className="text-xs opacity-90 mt-0.5">
                  {statusMessage}
                </p>
              </div>
            </div>

            {/* Next Puzzle CTA when solved */}
            {status === 'solved' && (
              <div className="mt-4 pt-3 border-t border-emerald-500/20 flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleNextPuzzle}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg"
                >
                  <span>Next Puzzle</span> ➡️
                </Button>
              </div>
            )}
          </div>

          {/* Puzzle Info Card */}
          {currentPuzzle && (
            <div className="rounded-2xl border border-[#232b3d] bg-[#121622] p-4.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Tactical Themes
                </span>
                <span className="rounded bg-[#1a2130] border border-[#263045] px-2 py-0.5 text-[10px] font-mono text-gray-400">
                  {currentPuzzle.puzzleCode}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {currentPuzzle.themes?.map((t, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 text-xs font-medium text-indigo-300"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              <p className="text-xs text-gray-400 italic pt-1">
                "{currentPuzzle.description}"
              </p>
            </div>
          )}

          {/* Action Buttons Toolbar */}
          <div className="rounded-2xl border border-[#232b3d] bg-[#121622] p-4.5 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block">
              Controls
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={requestHint}
                disabled={status === 'solved'}
                className="border-[#2b354a] text-amber-400 hover:bg-amber-500/10 text-xs flex items-center justify-center gap-1"
              >
                <span>💡</span> Hint
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={retryCurrentPuzzle}
                className="border-[#2b354a] text-gray-300 hover:bg-[#1a2130] text-xs flex items-center justify-center gap-1"
              >
                <span>🔄</span> Retry
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={revealSolution}
                disabled={status === 'solved'}
                className="border-[#2b354a] text-gray-300 hover:bg-[#1a2130] text-xs flex items-center justify-center gap-1"
              >
                <span>👁️</span> Solution
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleNextPuzzle}
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1"
              >
                <span>➡️</span> Skip/Next
              </Button>
            </div>
          </div>

          {/* Filters: Difficulty & Theme */}
          <div className="rounded-2xl border border-[#232b3d] bg-[#121622] p-4.5 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block">
              Filter Tactical Problems
            </span>

            <div className="space-y-2.5">
              <div>
                <label className="text-[11px] text-gray-400 font-medium block mb-1">
                  Difficulty Rating
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => {
                    setDifficulty(e.target.value);
                    loadPuzzle('random');
                  }}
                  className="w-full rounded-xl bg-[#161c28] border border-[#2b354a] px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  {difficultyList.map((d) => (
                    <option key={d.id} value={d.id}>{d.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-gray-400 font-medium block mb-1">
                  Theme / Tactical Motif
                </label>
                <select
                  value={selectedTheme}
                  onChange={(e) => {
                    setTheme(e.target.value);
                    loadPuzzle('random');
                  }}
                  className="w-full rounded-xl bg-[#161c28] border border-[#2b354a] px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  {themesList.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Lifetime Puzzle Statistics */}
          <div className="rounded-2xl border border-[#232b3d] bg-[#121622] p-4.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-3">
              Performance Statistics
            </span>

            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="rounded-xl bg-[#161c28] border border-[#232b3d] p-2.5">
                <span className="text-[10px] uppercase text-gray-400">Solved</span>
                <p className="text-base font-bold text-emerald-400 mt-0.5">
                  {stats.puzzlesSolved || 0}
                </p>
              </div>
              <div className="rounded-xl bg-[#161c28] border border-[#232b3d] p-2.5">
                <span className="text-[10px] uppercase text-gray-400">Attempted</span>
                <p className="text-base font-bold text-white mt-0.5">
                  {stats.puzzlesAttempted || 0}
                </p>
              </div>
              <div className="rounded-xl bg-[#161c28] border border-[#232b3d] p-2.5">
                <span className="text-[10px] uppercase text-gray-400">Accuracy</span>
                <p className="text-base font-bold text-indigo-400 mt-0.5">
                  {stats.successRate || 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
