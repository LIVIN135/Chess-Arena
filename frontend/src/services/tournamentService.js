import api from './api';

export const tournamentService = {
  getTournaments: async (params = {}) => {
    const res = await api.get('/tournaments', { params });
    return res.data;
  },

  getTournamentDetails: async (id) => {
    const res = await api.get(`/tournaments/${id}`);
    return res.data;
  },

  createTournament: async (data) => {
    const res = await api.post('/tournaments', data);
    return res.data;
  },

  joinTournament: async (id) => {
    const res = await api.post(`/tournaments/${id}/join`);
    return res.data;
  },

  leaveTournament: async (id) => {
    const res = await api.post(`/tournaments/${id}/leave`);
    return res.data;
  },

  startTournament: async (id) => {
    const res = await api.post(`/tournaments/${id}/start`);
    return res.data;
  },

  submitMatchResult: async (tournamentId, matchId, result) => {
    const res = await api.post(`/tournaments/${tournamentId}/matches/${matchId}/result`, { result });
    return res.data;
  },

  advanceNextRound: async (id) => {
    const res = await api.post(`/tournaments/${id}/next-round`);
    return res.data;
  },

  concludeTournament: async (id) => {
    const res = await api.post(`/tournaments/${id}/conclude`);
    return res.data;
  },
};
