import React from 'react';
import { Trophy, Medal, Award, Flame, UserCheck } from 'lucide-react';

export const TournamentStandings = ({ participants = [], isCompleted = false }) => {
  if (!participants || participants.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 bg-[#0e121a] rounded-xl border border-[#1e2535]">
        <p className="text-sm">No players registered yet.</p>
      </div>
    );
  }

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return (
          <div className="flex items-center gap-1 text-amber-300 font-bold text-sm">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-sm shadow-amber-500/10">
              1
            </span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
        );
      case 2:
        return (
          <div className="flex items-center gap-1 text-slate-300 font-bold text-sm">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-400/20 border border-slate-400/40 text-slate-300">
              2
            </span>
            <Medal className="w-4 h-4 text-slate-300" />
          </div>
        );
      case 3:
        return (
          <div className="flex items-center gap-1 text-amber-600 font-bold text-sm">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-700/20 border border-amber-700/40 text-amber-600">
              3
            </span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
        );
      default:
        return (
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1b2230] text-gray-400 text-xs font-semibold">
            {rank}
          </span>
        );
    }
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#222a3d] bg-[#10141f] shadow-xl">
      <table className="w-full text-left text-sm">
        <thead className="bg-[#151b29] border-b border-[#222a3d] text-xs uppercase tracking-wider text-gray-400">
          <tr>
            <th className="px-4 py-3.5 font-semibold text-center w-16">Rank</th>
            <th className="px-4 py-3.5 font-semibold">Player</th>
            <th className="px-4 py-3.5 font-semibold text-center">Score</th>
            <th className="px-4 py-3.5 font-semibold text-center hidden sm:table-cell">W / D / L</th>
            <th className="px-4 py-3.5 font-semibold text-center hidden md:table-cell">Tiebreak</th>
            <th className="px-4 py-3.5 font-semibold text-center">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1b2233]">
          {participants.map((p, idx) => {
            const isPodium = p.rank <= 3 && isCompleted;
            return (
              <tr
                key={p.id || idx}
                className={`transition-colors hover:bg-[#151c2a] ${
                  p.rank === 1 && isCompleted
                    ? 'bg-amber-500/5'
                    : ''
                }`}
              >
                {/* Rank */}
                <td className="px-4 py-3.5 text-center">
                  <div className="flex justify-center">{getRankBadge(p.rank || idx + 1)}</div>
                </td>

                {/* Player Name & Rating */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-amber-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                      {p.username ? p.username[0].toUpperCase() : 'P'}
                    </div>
                    <div>
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <span>{p.username}</span>
                        {p.rank === 1 && isCompleted && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-black px-1.5 py-0.2 rounded font-mono">
                            Champion
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-amber-400/90 font-mono">
                        {p.rating || 1200} Elo
                      </span>
                    </div>
                  </div>
                </td>

                {/* Points / Score */}
                <td className="px-4 py-3.5 text-center font-bold font-mono text-base text-white">
                  <span className="px-2.5 py-1 rounded-lg bg-[#182030] border border-[#273248] text-amber-300">
                    {p.score !== undefined ? p.score : 0.0}
                  </span>
                </td>

                {/* W / D / L */}
                <td className="px-4 py-3.5 text-center font-mono text-xs text-gray-300 hidden sm:table-cell">
                  <span className="text-emerald-400 font-semibold">{p.wins || 0}</span>
                  <span className="text-gray-500 mx-1">/</span>
                  <span className="text-gray-400">{p.draws || 0}</span>
                  <span className="text-gray-500 mx-1">/</span>
                  <span className="text-red-400">{p.losses || 0}</span>
                </td>

                {/* Tiebreak */}
                <td className="px-4 py-3.5 text-center font-mono text-xs text-gray-400 hidden md:table-cell">
                  {p.tieBreak !== undefined ? p.tieBreak : 0.0}
                </td>

                {/* Status */}
                <td className="px-4 py-3.5 text-center">
                  {p.active ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">
                      Out
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
