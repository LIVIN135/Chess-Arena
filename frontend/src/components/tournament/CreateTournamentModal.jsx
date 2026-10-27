import React, { useState } from 'react';
import { X, Trophy, Swords, Clock, Users } from 'lucide-react';

export const CreateTournamentModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('SWISS');
  const [timeControl, setTimeControl] = useState('5m');
  const [maxParticipants, setMaxParticipants] = useState(16);
  const [roundsTotal, setRoundsTotal] = useState(3);
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Please enter a tournament name');
      return;
    }

    try {
      setFormError('');
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        type,
        timeControl,
        maxParticipants: Number(maxParticipants),
        roundsTotal: Number(roundsTotal),
      });
      onClose();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to create tournament');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-[#2a3449] bg-[#121622] p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1f2738] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Create Tournament</h2>
              <p className="text-xs text-gray-400">Host your own competitive chess event</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#1f2738] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {formError && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Tournament Name */}
          <div className="space-y-1.5">
            <label className="font-semibold text-gray-200">Tournament Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Saturday Night Blitz Arena"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#263147] bg-[#0c0f18] text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="font-semibold text-gray-200">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tournament rules, schedule notes, or invite info..."
              rows={2}
              className="w-full px-3.5 py-2 rounded-xl border border-[#263147] bg-[#0c0f18] text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors resize-none"
            />
          </div>

          {/* Format & Time Control Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Format */}
            <div className="space-y-1.5">
              <label className="font-semibold text-gray-200">Format</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#263147] bg-[#0c0f18] text-white focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="SWISS">Swiss System</option>
                <option value="ARENA">Arena Fast-Play</option>
                <option value="SINGLE_ELIMINATION">Knockout</option>
              </select>
            </div>

            {/* Time Control */}
            <div className="space-y-1.5">
              <label className="font-semibold text-gray-200">Time Control</label>
              <select
                value={timeControl}
                onChange={(e) => setTimeControl(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#263147] bg-[#0c0f18] text-white focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="1m">1m Bullet</option>
                <option value="1|1">1+1 Bullet</option>
                <option value="3m">3m Blitz</option>
                <option value="3|2">3+2 Blitz</option>
                <option value="5m">5m Blitz</option>
                <option value="10m">10m Rapid</option>
              </select>
            </div>
          </div>

          {/* Max Participants & Rounds */}
          <div className="grid grid-cols-2 gap-3">
            {/* Max Participants */}
            <div className="space-y-1.5">
              <label className="font-semibold text-gray-200">Max Players</label>
              <select
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-[#263147] bg-[#0c0f18] text-white focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value={8}>8 Players</option>
                <option value={16}>16 Players</option>
                <option value={32}>32 Players</option>
              </select>
            </div>

            {/* Total Rounds */}
            <div className="space-y-1.5">
              <label className="font-semibold text-gray-200">Total Rounds</label>
              <select
                value={roundsTotal}
                onChange={(e) => setRoundsTotal(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-[#263147] bg-[#0c0f18] text-white focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value={3}>3 Rounds</option>
                <option value={4}>4 Rounds</option>
                <option value={5}>5 Rounds</option>
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1f2738]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#1a2130] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl font-bold bg-amber-500 text-black hover:bg-amber-400 shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Launch Tournament'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
