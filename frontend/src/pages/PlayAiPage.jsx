import React, { useEffect, useState } from 'react';
import { AiChessBoardView } from '../components/chess/AiChessBoardView';
import { AiPromotionDialog } from '../components/chess/AiPromotionDialog';
import { AiPlayerBar } from '../components/chess/AiPlayerBar';
import { EvalBar } from '../components/chess/EvalBar';
import { useAiStore, AI_TIME_CONTROLS } from '../store/useAiStore';
import { Bot, RotateCcw, Flag, Undo2, Play, Sparkles, Brain, Trophy, ShieldAlert } from 'lucide-react';

export const PlayAiPage = () => {
  const {
    botList,
    selectedBot,
    colorChoice,
    timeControl,
    status,
    isThinking,
    assignedPlayerColor,
    evaluation,
    history,
    winner,
    terminationReason,
    loadBots,
    selectBot,
    setColorChoice,
    setTimeControl,
    startGame,
    takebackMove,
    resign,
    resetToSetup,
  } = useAiStore();

  const [showResignConfirm, setShowResignConfirm] = useState(false);

  useEffect(() => {
    loadBots();
  }, [loadBots]);

  const isPlayerWhite = assignedPlayerColor === 'white';
  const playerWon = (winner === 'White' && isPlayerWhite) || (winner === 'Black' && !isPlayerWhite);
  const isDraw = winner === 'Draw';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#262c3b] pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Bot className="h-6 w-6 text-indigo-400" />
            <span>Play vs Computer</span>
          </h1>
          <p className="text-xs text-gray-400">
            Challenge adaptive AI bot personalities powered by Minimax, Alpha-Beta pruning, and positional heuristics
          </p>
        </div>

        {status === 'PLAYING' && (
          <button
            onClick={resetToSetup}
            className="px-3 py-1.5 rounded-lg border border-[#262c3b] bg-[#151921] hover:bg-[#1c212c] text-xs font-semibold text-gray-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Change Bot</span>
          </button>
        )}
      </div>

      {/* SETUP VIEW: Bot selection, color, time control */}
      {status === 'SETUP' && (
        <div className="max-w-4xl mx-auto py-6 space-y-8 animate-in fade-in">
          {/* Step 1: Choose Bot Personality */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Brain className="h-5 w-5 text-indigo-400" />
              <span>1. Choose Your Opponent</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {botList.map((bot) => {
                const isSelected = selectedBot?.id === bot.id;
                return (
                  <button
                    key={bot.id}
                    onClick={() => selectBot(bot)}
                    className={`relative p-5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#1f2038] to-[#151921] border-indigo-500 shadow-xl shadow-indigo-500/10 ring-2 ring-indigo-500/50'
                        : 'bg-[#151921] border-[#262c3b] hover:border-[#384154] hover:bg-[#1a202c]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-3xl p-2 rounded-xl bg-[#0b0e14] border border-[#262c3b] shadow-inner">
                          {bot.avatar}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                            bot.difficulty === 'Novice'
                              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                              : bot.difficulty === 'Intermediate'
                              ? 'bg-sky-950/60 text-sky-400 border-sky-800'
                              : bot.difficulty === 'Advanced'
                              ? 'bg-amber-950/60 text-amber-400 border-amber-800'
                              : 'bg-rose-950/60 text-rose-400 border-rose-800'
                          }`}
                        >
                          {bot.difficulty}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white">{bot.name}</h3>
                      <p className="text-xs text-indigo-400 font-mono font-semibold mt-0.5">
                        {bot.rating} ELO
                      </p>
                      <p className="text-xs text-gray-400 mt-2 line-clamp-3 leading-relaxed">
                        {bot.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#262c3b] mt-4 flex items-center justify-between text-[11px] text-gray-500">
                      <span>Search: Depth {bot.depth}</span>
                      <span className="font-semibold text-gray-400">
                        {isSelected ? '✓ Selected' : 'Select'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Choose Color & Time Control */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Color Choice */}
            <div className="p-5 rounded-2xl bg-[#151921] border border-[#262c3b] space-y-3">
              <h3 className="text-sm font-bold text-white">2. Play As Color</h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'white', label: 'White', icon: '♔', sub: 'First Move' },
                  { id: 'random', label: 'Random', icon: '🎲', sub: 'Surprise' },
                  { id: 'black', label: 'Black', icon: '♚', sub: 'Second Move' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setColorChoice(c.id)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      colorChoice === c.id
                        ? 'bg-indigo-950/50 border-indigo-500 text-white shadow-md ring-1 ring-indigo-500'
                        : 'bg-[#1c212c] border-[#262c3b] text-gray-300 hover:bg-[#252c3b]'
                    }`}
                  >
                    <span className="text-2xl block">{c.icon}</span>
                    <span className="text-xs font-bold block mt-1">{c.label}</span>
                    <span className="text-[10px] text-gray-400 block">{c.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Control */}
            <div className="p-5 rounded-2xl bg-[#151921] border border-[#262c3b] space-y-3">
              <h3 className="text-sm font-bold text-white">3. Time Control</h3>
              <div className="grid grid-cols-2 gap-2">
                {AI_TIME_CONTROLS.map((tc) => (
                  <button
                    key={tc.id}
                    onClick={() => setTimeControl(tc)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      timeControl.id === tc.id
                        ? 'bg-indigo-950/50 border-indigo-500 text-white shadow-md ring-1 ring-indigo-500'
                        : 'bg-[#1c212c] border-[#262c3b] text-gray-300 hover:bg-[#252c3b]'
                    }`}
                  >
                    <span className="text-xs font-bold block">{tc.name}</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      {tc.initialMs ? `${tc.initialMs / 60000} mins` : 'Relaxed Practice'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CTA: Start Game */}
          <div className="pt-2 flex justify-center">
            <button
              onClick={startGame}
              className="py-4 px-10 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-98 transition-all shadow-xl shadow-indigo-600/30 flex items-center gap-2.5 cursor-pointer"
            >
              <Play className="h-5 w-5 fill-current" />
              <span>Start Match vs {selectedBot?.name}</span>
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE MATCH VIEW */}
      {(status === 'PLAYING' || status === 'GAME_OVER') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Board Column with EvalBar (7 cols) */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-3">
            {/* Top Bar (Bot) */}
            <AiPlayerBar isBot={true} />

            {/* Board and Eval Bar Row */}
            <div className="flex items-center justify-center gap-3">
              {/* Dynamic Evaluation Bar */}
              <EvalBar evaluation={evaluation} orientation={assignedPlayerColor} />

              {/* Chessboard View */}
              <div className="relative flex-1 max-w-[520px]">
                <AiChessBoardView />
                <AiPromotionDialog />
              </div>
            </div>

            {/* Bottom Bar (Human Player) */}
            <AiPlayerBar isBot={false} />
          </div>

          {/* Side Panel Column (5 cols) */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-4">
            {/* Bot Profile & Eval Card */}
            <div className="p-4 rounded-xl bg-[#151921] border border-[#262c3b] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedBot?.avatar}</span>
                  <div>
                    <h3 className="text-sm font-bold text-white">{selectedBot?.name}</h3>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {selectedBot?.difficulty} • {selectedBot?.rating} ELO
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-gray-400 block uppercase tracking-wider">
                    Position Eval
                  </span>
                  <span
                    className={`font-mono text-sm font-bold ${
                      evaluation > 0 ? 'text-emerald-400' : evaluation < 0 ? 'text-rose-400' : 'text-gray-300'
                    }`}
                  >
                    {evaluation > 0 ? `+${evaluation.toFixed(1)}` : evaluation.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Action Controls */}
              {status === 'PLAYING' && (
                <div className="pt-3 border-t border-[#262c3b] grid grid-cols-2 gap-2">
                  <button
                    onClick={takebackMove}
                    disabled={isThinking || history.length === 0}
                    className="py-2 px-3 rounded-lg bg-[#1c212c] hover:bg-[#262c3b] border border-[#262c3b] text-gray-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
                    title="Undo both computer and your move"
                  >
                    <Undo2 className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Takeback Move</span>
                  </button>

                  <button
                    onClick={() => setShowResignConfirm(true)}
                    disabled={isThinking}
                    className="py-2 px-3 rounded-lg bg-rose-950/30 hover:bg-rose-950/60 border border-rose-900/60 text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
                  >
                    <Flag className="h-3.5 w-3.5" />
                    <span>Resign</span>
                  </button>
                </div>
              )}

              {/* Resign confirm alert */}
              {showResignConfirm && (
                <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-xs space-y-2 text-center">
                  <p className="font-semibold text-rose-200">Resign against {selectedBot?.name}?</p>
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => {
                        setShowResignConfirm(false);
                        resign();
                      }}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded cursor-pointer"
                    >
                      Yes, Resign
                    </button>
                    <button
                      onClick={() => setShowResignConfirm(false)}
                      className="px-3 py-1 bg-[#1c212c] text-gray-300 rounded cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Move History Table */}
            <div className="p-4 rounded-xl bg-[#151921] border border-[#262c3b] space-y-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Move History ({history.length} moves)
              </h3>

              <div className="h-60 overflow-y-auto pr-1 text-xs font-mono space-y-1 scrollbar-thin">
                {history.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Make your first move on the board.</p>
                ) : (
                  Array.from({ length: Math.ceil(history.length / 2) }).map((_, i) => {
                    const whiteMove = history[i * 2];
                    const blackMove = history[i * 2 + 1];
                    return (
                      <div
                        key={i}
                        className="grid grid-cols-12 py-1 px-2 rounded hover:bg-[#1c212c] transition-colors"
                      >
                        <span className="col-span-2 text-gray-500">{i + 1}.</span>
                        <span className="col-span-5 font-semibold text-gray-200">
                          {whiteMove ? whiteMove.san : ''}
                        </span>
                        <span className="col-span-5 font-semibold text-gray-400">
                          {blackMove ? blackMove.san : ''}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Game Over Modal / Card */}
            {status === 'GAME_OVER' && (
              <div className="p-5 rounded-2xl bg-[#151921] border border-indigo-500/80 shadow-2xl text-center space-y-4 animate-in zoom-in-95">
                <div className="space-y-1">
                  <div className="text-3xl mb-1">{playerWon ? '🏆' : isDraw ? '🤝' : '💀'}</div>
                  <h3
                    className={`text-2xl font-black ${
                      playerWon ? 'text-emerald-400' : isDraw ? 'text-amber-400' : 'text-rose-400'
                    }`}
                  >
                    {playerWon ? 'Victory!' : isDraw ? 'Game Drawn' : 'Defeat'}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Reason: <span className="text-gray-200 font-semibold">{terminationReason}</span>
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={startGame}
                    className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Rematch</span>
                  </button>
                  <button
                    onClick={resetToSetup}
                    className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs text-gray-300 bg-[#1c212c] hover:bg-[#252c3b] transition-all cursor-pointer"
                  >
                    Change Bot
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
