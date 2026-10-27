import React, { useState } from 'react';
import { Swords, CheckCircle2, Clock, User, ShieldCheck } from 'lucide-react';

export const TournamentBrackets = ({
  roundsTotal = 3,
  currentRound = 1,
  allMatches = [],
  onSubmitResult,
  isOrganizer = false,
  isActionLoading = false,
}) => {
  const [selectedRound, setSelectedRound] = useState(currentRound || 1);

  const roundsList = Array.from({ length: roundsTotal }, (_, i) => i + 1);
  const roundMatches = allMatches.filter((m) => m.roundNumber === selectedRound);

  const getResultTag = (match) => {
    switch (match.result) {
      case 'WHITE_WINS':
        return (
          <span className="font-mono font-bold text-xs px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            1 - 0
          </span>
        );
      case 'BLACK_WINS':
        return (
          <span className="font-mono font-bold text-xs px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
            0 - 1
          </span>
        );
      case 'DRAW':
        return (
          <span className="font-mono font-bold text-xs px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            ½ - ½
          </span>
        );
      default:
        return (
          <span className="font-mono font-semibold text-xs px-2 py-1 rounded bg-[#1c2230] text-gray-400 border border-[#2b3548]">
            VS
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Round Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#222a3d]">
        {roundsList.map((r) => {
          const isCurrent = r === currentRound;
          const isSelected = r === selectedRound;
          return (
            <button
              key={r}
              onClick={() => setSelectedRound(r)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-bold'
                  : 'bg-[#121622] text-gray-400 hover:text-white hover:bg-[#182030] border border-[#222a3d]'
              }`}
            >
              <span>Round {r}</span>
              {isCurrent && (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isSelected ? 'bg-black' : 'bg-red-400 animate-ping'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Matches Grid */}
      {roundMatches.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-[#0e121a] rounded-2xl border border-[#1e2535]">
          <p className="text-sm">Round {selectedRound} pairings have not been scheduled yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roundMatches.map((m) => {
            const isCompleted = m.status === 'COMPLETED';
            const isWhiteWinner = m.result === 'WHITE_WINS';
            const isBlackWinner = m.result === 'BLACK_WINS';

            return (
              <div
                key={m.id}
                className="rounded-2xl border border-[#222a3d] bg-[#10141f] p-4 shadow-lg hover:border-[#2d3852] transition-colors space-y-3"
              >
                {/* Board header */}
                <div className="flex items-center justify-between text-xs text-gray-400 border-b border-[#1b2233] pb-2">
                  <span className="font-semibold text-gray-300">Board {m.boardNumber}</span>
                  <div className="flex items-center gap-1.5">
                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Final
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] text-amber-400">
                        <Clock className="w-3.5 h-3.5" />
                        Scheduled
                      </span>
                    )}
                  </div>
                </div>

                {/* Matchup row */}
                <div className="flex items-center justify-between gap-3">
                  {/* White Player */}
                  <div className="flex-1 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-white text-black font-bold flex items-center justify-center text-xs shadow">
                      ♔
                    </div>
                    <div className="overflow-hidden">
                      <div
                        className={`text-sm font-semibold truncate ${
                          isWhiteWinner ? 'text-emerald-400 font-bold' : 'text-gray-200'
                        }`}
                      >
                        {m.whitePlayerUsername || 'BYE'}
                      </div>
                      <div className="text-[11px] text-gray-400 font-mono">
                        {m.whitePlayerRating ? `${m.whitePlayerRating} Elo` : '1200 Elo'}
                      </div>
                    </div>
                  </div>

                  {/* VS / Score tag */}
                  <div className="shrink-0">{getResultTag(m)}</div>

                  {/* Black Player */}
                  <div className="flex-1 flex items-center justify-end gap-2.5 text-right">
                    <div className="overflow-hidden">
                      <div
                        className={`text-sm font-semibold truncate ${
                          isBlackWinner ? 'text-emerald-400 font-bold' : 'text-gray-200'
                        }`}
                      >
                        {m.blackPlayerUsername || 'BYE'}
                      </div>
                      <div className="text-[11px] text-gray-400 font-mono">
                        {m.blackPlayerRating ? `${m.blackPlayerRating} Elo` : '1200 Elo'}
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#1e2330] border border-gray-600 text-white font-bold flex items-center justify-center text-xs shadow">
                      ♚
                    </div>
                  </div>
                </div>

                {/* Organizer quick result submission controls */}
                {!isCompleted && m.blackPlayerUsername && isOrganizer && (
                  <div className="pt-2 border-t border-[#1b2233] flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      Record Result:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        disabled={isActionLoading}
                        onClick={() => onSubmitResult(m.id, 'WHITE_WINS')}
                        className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition-colors"
                        title="White Wins (1-0)"
                      >
                        1 - 0
                      </button>
                      <button
                        disabled={isActionLoading}
                        onClick={() => onSubmitResult(m.id, 'DRAW')}
                        className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 transition-colors"
                        title="Draw (½-½)"
                      >
                        ½ - ½
                      </button>
                      <button
                        disabled={isActionLoading}
                        onClick={() => onSubmitResult(m.id, 'BLACK_WINS')}
                        className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 transition-colors"
                        title="Black Wins (0-1)"
                      >
                        0 - 1
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
