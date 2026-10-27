import React, { useEffect, useState } from 'react';
import { useTournamentStore } from '../store/useTournamentStore';
import { useAuthStore } from '../store/useAuthStore';
import { TournamentCard } from '../components/tournament/TournamentCard';
import { TournamentStandings } from '../components/tournament/TournamentStandings';
import { TournamentBrackets } from '../components/tournament/TournamentBrackets';
import { CreateTournamentModal } from '../components/tournament/CreateTournamentModal';
import {
  Trophy,
  Users,
  Swords,
  Plus,
  Play,
  RotateCcw,
  FastForward,
  CheckCircle,
  Clock,
  Sparkles,
  Award,
} from 'lucide-react';

export const TournamentsPage = () => {
  const { user } = useAuthStore();
  const {
    tournaments,
    selectedTournamentId,
    tournamentDetails,
    filterStatus,
    filterType,
    isLoading,
    isDetailLoading,
    isActionLoading,
    error,
    isCreateModalOpen,
    fetchTournaments,
    fetchTournamentDetails,
    setSelectedTournamentId,
    setFilterStatus,
    setFilterType,
    setCreateModalOpen,
    createTournament,
    joinTournament,
    leaveTournament,
    startTournament,
    submitMatchResult,
    advanceNextRound,
    concludeTournament,
  } = useTournamentStore();

  const [activeTab, setActiveTab] = useState('standings'); // 'standings' | 'brackets'

  useEffect(() => {
    fetchTournaments();
  }, [filterStatus, filterType]);

  // Auto-select first tournament if none selected
  useEffect(() => {
    if (tournaments.length > 0 && !selectedTournamentId) {
      setSelectedTournamentId(tournaments[0].id);
    }
  }, [tournaments, selectedTournamentId]);

  const selectedTournament = tournamentDetails?.tournament;
  const isOrganizer = tournamentDetails?.isUserCreator || (user && user.role === 'ROLE_ADMIN');
  const isRegistered = tournamentDetails?.isUserRegistered;

  const totalPlayersInActive = tournaments.reduce(
    (acc, t) => acc + (t.currentParticipantsCount || 0),
    0
  );
  const liveCount = tournaments.filter((t) => t.status === 'IN_PROGRESS').length;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#232b3d] bg-gradient-to-r from-[#111624] via-[#141b2b] to-[#0f1420] p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Competitive Arenas</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              <span>🏆</span> Tournaments &amp; Brackets
            </h1>
            <p className="text-sm text-gray-400 max-w-xl leading-relaxed">
              Compete in official Swiss championships and high-speed Arena tournaments with live
              pairings and Buchholz standings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold bg-amber-500 hover:bg-amber-400 text-black shadow-xl shadow-amber-500/20 active:scale-95 transition-all text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Host Tournament</span>
            </button>
          </div>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-6 pt-6 border-t border-[#1e2638]">
          <div className="bg-[#0c0f18]/60 backdrop-blur rounded-2xl p-3 sm:p-4 border border-[#1e2535]">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Live Competitions
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono">{liveCount}</div>
          </div>

          <div className="bg-[#0c0f18]/60 backdrop-blur rounded-2xl p-3 sm:p-4 border border-[#1e2535]">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-1">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              Active Players
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono">
              {totalPlayersInActive}
            </div>
          </div>

          <div className="bg-[#0c0f18]/60 backdrop-blur rounded-2xl p-3 sm:p-4 border border-[#1e2535]">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-1">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              Total Tournaments
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono">
              {tournaments.length}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f2638] pb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'ALL', label: 'All Tournaments' },
            { id: 'IN_PROGRESS', label: '🔴 Live Now' },
            { id: 'REGISTRATION_OPEN', label: '🟢 Open Entry' },
            { id: 'COMPLETED', label: '🏁 Finished' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterStatus === tab.id
                  ? 'bg-[#222c40] text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-[#141a27]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Format Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500 font-medium">Format:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#252f44] bg-[#0f1420] text-gray-300 focus:outline-none focus:border-amber-500 text-xs"
          >
            <option value="ALL">All Formats</option>
            <option value="SWISS">Swiss System</option>
            <option value="ARENA">Arena</option>
            <option value="SINGLE_ELIMINATION">Knockout</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Tournaments List (4 cols) & Detail Dashboard (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Tournament Cards List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-400 font-semibold uppercase tracking-wider px-1">
            <span>Available Events ({tournaments.length})</span>
            <button
              onClick={() => fetchTournaments()}
              className="hover:text-amber-400 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Refresh
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-36 rounded-2xl bg-[#111622] animate-pulse border border-[#1e2535]"
                />
              ))}
            </div>
          ) : tournaments.length === 0 ? (
            <div className="rounded-2xl border border-[#222a3d] bg-[#111622] p-8 text-center text-gray-400">
              <Trophy className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-xs">No tournaments found matching filter.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
              {tournaments.map((t) => (
                <TournamentCard
                  key={t.id}
                  tournament={t}
                  isSelected={t.id === selectedTournamentId}
                  onSelect={(id) => setSelectedTournamentId(id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Selected Tournament Detail Panel */}
        <div className="lg:col-span-8 space-y-6">
          {isDetailLoading || !selectedTournament ? (
            <div className="rounded-3xl border border-[#222a3d] bg-[#111622] p-12 text-center text-gray-400 animate-pulse">
              <p className="text-sm">Loading tournament arena...</p>
            </div>
          ) : (
            <div className="rounded-3xl border border-[#222a3d] bg-[#111622] overflow-hidden shadow-2xl space-y-6 p-6 sm:p-7">
              {/* Tournament Title & Actions Bar */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#1d2536] pb-6">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {selectedTournament.type}
                    </span>
                    <span className="text-[11px] font-semibold text-gray-400 bg-[#19202f] px-2 py-0.5 rounded">
                      ⏱️ {selectedTournament.timeControl}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    {selectedTournament.name}
                  </h2>
                  <p className="text-xs text-gray-400 max-w-xl">
                    {selectedTournament.description}
                  </p>
                </div>

                {/* Registration / Player Action */}
                <div className="flex flex-wrap items-center gap-2">
                  {selectedTournament.status === 'REGISTRATION_OPEN' && (
                    <>
                      {isRegistered ? (
                        <button
                          disabled={isActionLoading}
                          onClick={() => leaveTournament(selectedTournament.id)}
                          className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all"
                        >
                          Withdraw Entry
                        </button>
                      ) : (
                        <button
                          disabled={isActionLoading}
                          onClick={() => joinTournament(selectedTournament.id)}
                          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                        >
                          Join Tournament
                        </button>
                      )}
                    </>
                  )}

                  {/* Organizer Controls */}
                  {selectedTournament.status === 'REGISTRATION_OPEN' && isOrganizer && (
                    <button
                      disabled={
                        isActionLoading ||
                        selectedTournament.currentParticipantsCount < 2
                      }
                      onClick={() => startTournament(selectedTournament.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Start Tournament</span>
                    </button>
                  )}

                  {selectedTournament.status === 'IN_PROGRESS' && isOrganizer && (
                    <>
                      {selectedTournament.currentRound < selectedTournament.roundsTotal && (
                        <button
                          disabled={isActionLoading}
                          onClick={() => advanceNextRound(selectedTournament.id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg active:scale-95 transition-all"
                        >
                          <FastForward className="w-3.5 h-3.5" />
                          <span>Advance Next Round</span>
                        </button>
                      )}
                      <button
                        disabled={isActionLoading}
                        onClick={() => concludeTournament(selectedTournament.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#1e2638] hover:bg-[#253046] text-gray-200 border border-[#2d3850] transition-all"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Finish Event</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Sub-Tabs: Standings vs Brackets */}
              <div className="flex items-center gap-2 border-b border-[#1d2536] pb-2">
                <button
                  onClick={() => setActiveTab('standings')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'standings'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Leaderboard &amp; Standings</span>
                </button>

                <button
                  onClick={() => setActiveTab('brackets')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'brackets'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>
                    Pairings &amp; Brackets (
                    {tournamentDetails?.allMatches?.length || 0})
                  </span>
                </button>
              </div>

              {/* Tab Contents */}
              <div>
                {activeTab === 'standings' ? (
                  <TournamentStandings
                    participants={tournamentDetails.participants}
                    isCompleted={selectedTournament.status === 'COMPLETED'}
                  />
                ) : (
                  <TournamentBrackets
                    roundsTotal={selectedTournament.roundsTotal}
                    currentRound={selectedTournament.currentRound || 1}
                    allMatches={tournamentDetails.allMatches}
                    isOrganizer={isOrganizer}
                    isActionLoading={isActionLoading}
                    onSubmitResult={(matchId, result) =>
                      submitMatchResult(selectedTournament.id, matchId, result)
                    }
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Host Tournament Modal */}
      <CreateTournamentModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={createTournament}
        isLoading={isActionLoading}
      />
    </div>
  );
};
