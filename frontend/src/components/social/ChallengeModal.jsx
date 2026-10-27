import React, { useState } from 'react';
import { Button } from '../ui/Button';

export const ChallengeModal = ({ targetUser, isOpen, onClose, onSendChallenge, isLoading }) => {
  const [timeControl, setTimeControl] = useState('5m');
  const [colorPreference, setColorPreference] = useState('RANDOM');

  if (!isOpen || !targetUser) return null;

  const timeOptions = [
    { id: '1m', label: '1 min', sub: 'Bullet', icon: '⚡' },
    { id: '3m', label: '3 min', sub: 'Blitz', icon: '🔥' },
    { id: '5m', label: '5 min', sub: 'Rapid', icon: '⏱️' },
    { id: '10m', label: '10 min', sub: 'Standard', icon: '⏳' },
  ];

  const colorOptions = [
    { id: 'WHITE', label: 'White', icon: '⚪' },
    { id: 'RANDOM', label: 'Random', icon: '🎲' },
    { id: 'BLACK', label: 'Black', icon: '⚫' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSendChallenge(targetUser.id, timeControl, colorPreference);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-[#2a3245] bg-[#121620] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#202738]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 font-bold text-xl border border-amber-500/30">
              ⚔️
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Challenge to Match</h3>
              <p className="text-xs text-gray-400">Direct 1-on-1 Chess Battle</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-[#1a2130] hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Target Player Card */}
        <div className="my-5 flex items-center gap-3.5 rounded-xl bg-[#181e2c] border border-[#263045] p-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-base shadow-sm">
            {targetUser.username?.charAt(0).toUpperCase() || 'P'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white truncate text-sm">
                {targetUser.username}
              </span>
              <span className="rounded bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[11px] font-bold text-amber-400">
                {targetUser.rating || 1200} ELO
              </span>
            </div>
            <p className="text-xs text-gray-400 truncate mt-0.5">
              {targetUser.bio || 'Chess enthusiast'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Time Control Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Time Control
            </label>
            <div className="grid grid-cols-4 gap-2">
              {timeOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTimeControl(opt.id)}
                  className={`flex flex-col items-center justify-center rounded-xl p-2.5 border transition-all text-center ${
                    timeControl === opt.id
                      ? 'border-[#69923e] bg-[#69923e]/15 text-white shadow-sm ring-1 ring-[#69923e]'
                      : 'border-[#263045] bg-[#161c28] text-gray-400 hover:border-gray-500 hover:text-gray-200'
                  }`}
                >
                  <span className="text-base">{opt.icon}</span>
                  <span className="text-xs font-bold text-white mt-1">{opt.label}</span>
                  <span className="text-[10px] text-gray-400">{opt.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Preference */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Piece Color
            </label>
            <div className="grid grid-cols-3 gap-2">
              {colorOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setColorPreference(opt.id)}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 border transition-all ${
                    colorPreference === opt.id
                      ? 'border-indigo-500 bg-indigo-500/15 text-white ring-1 ring-indigo-500'
                      : 'border-[#263045] bg-[#161c28] text-gray-400 hover:border-gray-500 hover:text-gray-200'
                  }`}
                >
                  <span>{opt.icon}</span>
                  <span className="text-xs font-semibold">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#202738]">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isLoading}
              className="bg-amber-600 hover:bg-amber-500 text-white font-semibold flex items-center gap-2"
            >
              {isLoading ? 'Sending...' : '⚔️ Issue Challenge'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
