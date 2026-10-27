import api from './api';

export const aiService = {
  // Fetch available AI bot personalities
  getBots: async () => {
    try {
      const response = await api.get('/ai/bots');
      return response.data?.data || [];
    } catch (err) {
      console.warn('Backend bots endpoint failed, falling back to client profiles:', err.message);
      return [
        {
          id: 'NOVICE',
          name: 'Pawn Prodigy',
          difficulty: 'Novice',
          rating: 800,
          description: 'Learning the fundamentals. Plays rapidly and occasionally blunders pieces.',
          avatar: '♟️',
          depth: 1,
        },
        {
          id: 'INTERMEDIATE',
          name: 'Knight Templar',
          difficulty: 'Intermediate',
          rating: 1300,
          description: 'Solid tactical opponent. Actively looks for captures and piece development.',
          avatar: '♞',
          depth: 2,
        },
        {
          id: 'ADVANCED',
          name: 'Bishop Strategist',
          difficulty: 'Advanced',
          rating: 1700,
          description: 'Strong positional player. Controls diagonals, center squares, and king safety.',
          avatar: '♝',
          depth: 3,
        },
        {
          id: 'MASTER',
          name: 'Grandmaster Engine',
          difficulty: 'Master',
          rating: 2100,
          description: 'Deep tactical calculations with minimax alpha-beta pruning. Highly accurate.',
          avatar: '👑',
          depth: 4,
        },
      ];
    }
  },

  // Compute AI move from backend API
  getAiMove: async (fen, difficulty = 'INTERMEDIATE') => {
    const response = await api.post('/ai/move', {
      fen,
      difficulty,
    });
    return response.data?.data;
  },
};

export default aiService;
