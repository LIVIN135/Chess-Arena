import React from 'react';
import { Trophy, Users, Clock, Swords, ChevronRight, ShieldCheck, Flame } from 'lucide-react';

export const TournamentCard = ({ tournament, onSelect, isSelected }) => {
  const {
    id,
    name,
    description,
    type,
    status,
    timeControl,
    maxParticipants,
    currentParticipantsCount,
    roundsTotal,
    currentRound,
  } = tournament;

  const percentFull = Math.min(100, Math.round((currentParticipantsCount / maxParticipants) * 100));

  const getStatusBadge = () => {
    switch (status) {
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
            Live Round {currentRound}/{roundsTotal}
          </span>
        );
      case 'REGISTRATION_OPEN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Registration Open
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Trophy className="w-3 h-3 text-amber-400" />
            Finished
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Upcoming
          </span>
        );
    }
  };

  const getTypeBadge = () => {
    const label = type === 'SWISS' ? 'Swiss System' : type === 'ARENA' ? 'Arena' : 'Knockout';
    return (
      <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400 bg-[#1c2230] px-2 py-0.5 rounded border border-[#2d374d]">
        {label}
      </span>
    );
  };

  return (
    <div
      onClick={() => onSelect(id)}
      className={`group relative rounded-2xl p-5 cursor-pointer transition-all duration-200 border ${
        isSelected
          ? 'bg-[#182030] border-amber-500/60 shadow-xl shadow-amber-500/5 ring-1 ring-amber-500/40'
          : 'bg-[#111622] border-[#222a3d] hover:bg-[#151c2a] hover:border-[#323d57] hover:shadow-lg'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          {getTypeBadge()}
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            <Clock className="w-3 h-3" />
            {timeControl}
          </span>
        </div>
        {getStatusBadge()}
      </div>

      <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1 mb-1">
        {name}
      </h3>
      <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
        {description || 'Official competitive chess arena tournament.'}
      </p>

      {/* Progress & Stats */}
      <div className="space-y-2 pt-2 border-t border-[#1e2535]">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-gray-400" />
            <span>Players</span>
          </span>
          <span className="font-semibold text-gray-200">
            {currentParticipantsCount} <span className="text-gray-500">/ {maxParticipants}</span>
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full bg-[#1e2638] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              percentFull >= 100
                ? 'bg-amber-400'
                : percentFull > 50
                ? 'bg-emerald-400'
                : 'bg-blue-400'
            }`}
            style={{ width: `${percentFull}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between pt-2">
        <span className="text-[11px] text-gray-400 font-medium">
          {roundsTotal} Rounds • {type}
        </span>
        <span className="flex items-center gap-1 text-xs font-semibold text-amber-400 group-hover:translate-x-0.5 transition-transform">
          View Bracket <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};
