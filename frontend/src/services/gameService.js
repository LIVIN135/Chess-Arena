import api from './api';

export const gameService = {
  async createGame(payload) {
    const response = await api.post('/games', payload);
    return response.data?.data;
  },

  async endGame(gameId, endData) {
    const response = await api.post(`/games/${gameId}/end`, endData);
    return response.data?.data;
  },

  async getGameById(gameId) {
    const response = await api.get(`/games/${gameId}`);
    return response.data?.data;
  },

  async getGameHistory(page = 0, size = 20) {
    const response = await api.get(`/games/history?page=${page}&size=${size}`);
    return response.data?.data || [];
  },

  async getRecentGames(limit = 15) {
    const response = await api.get(`/games/recent?limit=${limit}`);
    return response.data?.data || [];
  },
};

export default gameService;
