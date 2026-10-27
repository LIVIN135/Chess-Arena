import api from './api';

export const puzzleService = {
  getRandomPuzzle: async (rating, theme) => {
    const params = new URLSearchParams();
    if (rating) params.append('rating', rating);
    if (theme && theme !== 'all') params.append('theme', theme);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await api.get(`/puzzles/random${qs}`);
    return res.data?.data;
  },

  getDailyPuzzle: async () => {
    const res = await api.get('/puzzles/daily');
    return res.data?.data;
  },

  getPuzzleById: async (id) => {
    const res = await api.get(`/puzzles/${id}`);
    return res.data?.data;
  },

  submitAttempt: async (puzzleId, isSolved, timeTakenSeconds = 0) => {
    const res = await api.post(`/puzzles/${puzzleId}/attempt`, {
      isSolved,
      timeTakenSeconds,
    });
    return res.data?.data;
  },

  getStats: async () => {
    const res = await api.get('/puzzles/stats');
    return res.data?.data;
  },

  getThemes: async () => {
    const res = await api.get('/puzzles/themes');
    return res.data?.data || [];
  },
};
