import { create } from 'zustand';
import { tournamentService } from '../services/tournamentService';

export const useTournamentStore = create((set, get) => ({
  tournaments: [],
  selectedTournamentId: null,
  tournamentDetails: null,
  filterStatus: 'ALL',
  filterType: 'ALL',
  isLoading: false,
  isDetailLoading: false,
  isActionLoading: false,
  error: null,
  isCreateModalOpen: false,

  setFilterStatus: (filterStatus) => set({ filterStatus }),
  setFilterType: (filterType) => set({ filterType }),
  setSelectedTournamentId: (id) => {
    set({ selectedTournamentId: id });
    if (id) {
      get().fetchTournamentDetails(id);
    } else {
      set({ tournamentDetails: null });
    }
  },
  setCreateModalOpen: (isCreateModalOpen) => set({ isCreateModalOpen }),

  fetchTournaments: async () => {
    set({ isLoading: true, error: null });
    try {
      const { filterStatus, filterType } = get();
      const params = {};
      if (filterStatus !== 'ALL') params.status = filterStatus;
      if (filterType !== 'ALL') params.type = filterType;

      const data = await tournamentService.getTournaments(params);
      set({ tournaments: data, isLoading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to fetch tournaments',
        isLoading: false,
      });
    }
  },

  fetchTournamentDetails: async (id) => {
    set({ isDetailLoading: true, error: null });
    try {
      const data = await tournamentService.getTournamentDetails(id);
      set({ tournamentDetails: data, isDetailLoading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to load tournament details',
        isDetailLoading: false,
      });
    }
  },

  createTournament: async (formData) => {
    set({ isActionLoading: true, error: null });
    try {
      const created = await tournamentService.createTournament(formData);
      set({ isCreateModalOpen: false, isActionLoading: false });
      await get().fetchTournaments();
      get().setSelectedTournamentId(created.id);
      return created;
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to create tournament',
        isActionLoading: false,
      });
      throw err;
    }
  },

  joinTournament: async (id) => {
    set({ isActionLoading: true, error: null });
    try {
      await tournamentService.joinTournament(id);
      await get().fetchTournamentDetails(id);
      await get().fetchTournaments();
      set({ isActionLoading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to join tournament',
        isActionLoading: false,
      });
      throw err;
    }
  },

  leaveTournament: async (id) => {
    set({ isActionLoading: true, error: null });
    try {
      await tournamentService.leaveTournament(id);
      await get().fetchTournamentDetails(id);
      await get().fetchTournaments();
      set({ isActionLoading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to leave tournament',
        isActionLoading: false,
      });
      throw err;
    }
  },

  startTournament: async (id) => {
    set({ isActionLoading: true, error: null });
    try {
      const details = await tournamentService.startTournament(id);
      set({ tournamentDetails: details, isActionLoading: false });
      await get().fetchTournaments();
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to start tournament',
        isActionLoading: false,
      });
      throw err;
    }
  },

  submitMatchResult: async (tournamentId, matchId, result) => {
    set({ isActionLoading: true, error: null });
    try {
      const details = await tournamentService.submitMatchResult(tournamentId, matchId, result);
      set({ tournamentDetails: details, isActionLoading: false });
      await get().fetchTournaments();
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to submit match result',
        isActionLoading: false,
      });
      throw err;
    }
  },

  advanceNextRound: async (id) => {
    set({ isActionLoading: true, error: null });
    try {
      const details = await tournamentService.advanceNextRound(id);
      set({ tournamentDetails: details, isActionLoading: false });
      await get().fetchTournaments();
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to advance to next round',
        isActionLoading: false,
      });
      throw err;
    }
  },

  concludeTournament: async (id) => {
    set({ isActionLoading: true, error: null });
    try {
      const details = await tournamentService.concludeTournament(id);
      set({ tournamentDetails: details, isActionLoading: false });
      await get().fetchTournaments();
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to conclude tournament',
        isActionLoading: false,
      });
      throw err;
    }
  },
}));
