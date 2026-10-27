import api from './api';

export const socialService = {
  getOverview: async () => {
    const response = await api.get('/social/overview');
    return response.data?.data;
  },

  getLeaderboard: async () => {
    const response = await api.get('/social/leaderboard');
    return response.data?.data || [];
  },

  searchUsers: async (query) => {
    if (!query || !query.trim()) return [];
    const response = await api.get(`/social/users/search?q=${encodeURIComponent(query.trim())}`);
    return response.data?.data || [];
  },

  getUserProfile: async (userId) => {
    const response = await api.get(`/social/users/${userId}`);
    return response.data?.data;
  },

  getUserProfileByUsername: async (username) => {
    const response = await api.get(`/social/users/username/${encodeURIComponent(username)}`);
    return response.data?.data;
  },

  updateBio: async (bio) => {
    const response = await api.put('/social/profile/bio', { bio });
    return response.data?.data;
  },

  sendFriendRequest: async (targetUserId) => {
    const response = await api.post(`/social/friends/request/${targetUserId}`);
    return response.data?.data;
  },

  acceptFriendRequest: async (friendshipId) => {
    const response = await api.post(`/social/friends/${friendshipId}/accept`);
    return response.data?.data;
  },

  declineFriendRequest: async (friendshipId) => {
    const response = await api.post(`/social/friends/${friendshipId}/decline`);
    return response.data?.data;
  },

  removeFriend: async (friendshipId) => {
    const response = await api.delete(`/social/friends/${friendshipId}`);
    return response.data?.data;
  },

  getFriends: async () => {
    const response = await api.get('/social/friends');
    return response.data?.data || [];
  },

  getFriendRequests: async () => {
    const response = await api.get('/social/friends/requests');
    return response.data?.data || [];
  },

  createChallenge: async (targetUserId, timeControl = '10m', colorPreference = 'RANDOM') => {
    const response = await api.post('/social/challenges', {
      targetUserId,
      timeControl,
      colorPreference,
    });
    return response.data?.data;
  },

  acceptChallenge: async (challengeId) => {
    const response = await api.post(`/social/challenges/${challengeId}/accept`);
    return response.data?.data;
  },

  declineChallenge: async (challengeId) => {
    const response = await api.post(`/social/challenges/${challengeId}/decline`);
    return response.data?.data;
  },

  getPendingChallenges: async () => {
    const response = await api.get('/social/challenges/pending');
    return response.data?.data || [];
  },
};
