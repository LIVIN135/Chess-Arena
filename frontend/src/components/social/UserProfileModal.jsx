import React from 'react';
import { Button } from '../ui/Button';

export const UserProfileModal = ({
  profile,
  isOpen,
  onClose,
  onChallenge,
  onAddFriend,
  isFriend,
  isSelf,
}) => {
  if (!isOpen || !profile) return null;

  const getTier = (rating) => {
    if (rating >= 2000) return { label: 'Grandmaster', color: 'from-amber-400 to-yellow-600', text: 'text-amber-300' };
    if (rating >= 1800) return { label: 'Master', color: 'from-purple-500 to-indigo-600', text: 'text-purple-300' };
    if (rating >= 1500) return { label: 'Expert', color: 'from-blue-500 to-cyan-600', text: 'text-blue-300' };
    if (rating >= 1300) return { label: 'Intermediate', color: 'from-emerald-500 to-teal-600', text: 'text-emerald-300' };
    return { label: 'Challenger', color: 'from-gray-500 to-slate-600', text: 'text-gray-300' };
  };

  const tier = getTier(profile.rating || 1200);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-[#2a3245] bg-[#121620] p-6 shadow-2xl">
        {/* Close Button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-[#1a2130] hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Profile Header */}
        <div className="flex flex-col items-center text-center -mt-3 pb-5 border-b border-[#202738]">
          <div className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${tier.color} text-white flex items-center justify-center text-3xl font-extrabold shadow-lg mb-3 ring-4 ring-[#1c2436]`}>
            {profile.username?.charAt(0).toUpperCase() || 'P'}
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {profile.username}
          </h2>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#1b2232] border border-[#2a354c] ${tier.text}`}>
              {tier.label}
            </span>
            <span className="text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full">
              {profile.rating || 1200} ELO
            </span>
          </div>
          <p className="text-xs text-gray-400 max-w-xs mt-3 italic">
            "{profile.bio || 'Chess enthusiast playing on Chess Arena'}"
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 my-5">
          <div className="rounded-xl bg-[#161c28] border border-[#232b3d] p-3 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Played</span>
            <p className="text-lg font-bold text-white mt-0.5">{profile.gamesPlayed || 0}</p>
          </div>
          <div className="rounded-xl bg-[#161c28] border border-[#232b3d] p-3 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">Won</span>
            <p className="text-lg font-bold text-emerald-400 mt-0.5">{profile.gamesWon || 0}</p>
          </div>
          <div className="rounded-xl bg-[#161c28] border border-[#232b3d] p-3 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">Win Rate</span>
            <p className="text-lg font-bold text-indigo-400 mt-0.5">
              {profile.winRate !== undefined ? `${profile.winRate}%` : '0%'}
            </p>
          </div>
        </div>

        {/* Win/Loss/Draw breakdown */}
        <div className="rounded-xl bg-[#151b27] border border-[#22293a] p-3 mb-6">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5 font-medium">
            <span>Performance Record</span>
            <span className="text-gray-300">
              {profile.gamesWon || 0}W - {profile.gamesLost || 0}L - {profile.gamesDrawn || 0}D
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-[#202738] overflow-hidden flex">
            {profile.gamesPlayed > 0 ? (
              <>
                <div
                  style={{ width: `${(profile.gamesWon / profile.gamesPlayed) * 100}%` }}
                  className="bg-emerald-500 h-full"
                  title="Wins"
                />
                <div
                  style={{ width: `${(profile.gamesDrawn / profile.gamesPlayed) * 100}%` }}
                  className="bg-gray-400 h-full"
                  title="Draws"
                />
                <div
                  style={{ width: `${(profile.gamesLost / profile.gamesPlayed) * 100}%` }}
                  className="bg-red-500 h-full"
                  title="Losses"
                />
              </>
            ) : (
              <div className="bg-gray-600 h-full w-full" />
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {!isSelf && (
          <div className="flex items-center gap-3">
            {!isFriend && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddFriend(profile.id)}
                className="flex-1 border-[#2a354c] hover:bg-[#1c2436] text-gray-200"
              >
                ➕ Add Friend
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={() => onChallenge(profile)}
              className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-semibold flex items-center justify-center gap-1.5"
            >
              <span>⚔️</span> Challenge
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
