import { create } from 'zustand';
import { socialService } from '../services/socialService';

export const useSocialStore = create((set, get) => ({
  leaderboard: [],
  friends: [],
  friendRequests: [],
  pendingChallenges: [],
  searchResults: [],
  activeProfile: null,

  isLeaderboardLoading: false,
  isFriendsLoading: false,
  isRequestsLoading: false,
  isChallengesLoading: false,
  isSearching: false,
  isActionLoading: false,
  error: null,
  successMessage: null,

  clearMessages: () => set({ error: null, successMessage: null }),

  fetchOverview: async () => {
    set({ isFriendsLoading: true, isRequestsLoading: true, isChallengesLoading: true });
    try {
      const data = await socialService.getOverview();
      set({
        friends: data?.friends || [],
        friendRequests: data?.friendRequests || [],
        pendingChallenges: data?.pendingChallenges || [],
        isFriendsLoading: false,
        isRequestsLoading: false,
        isChallengesLoading: false,
      });
    } catch (err) {
      set({
        error: err.message,
        isFriendsLoading: false,
        isRequestsLoading: false,
        isChallengesLoading: false,
      });
    }
  },

  fetchLeaderboard: async () => {
    set({ isLeaderboardLoading: true, error: null });
    try {
      const data = await socialService.getLeaderboard();
      set({ leaderboard: data, isLeaderboardLoading: false });
    } catch (err) {
      set({ error: err.message, isLeaderboardLoading: false });
    }
  },

  searchUsers: async (query) => {
    if (!query || !query.trim()) {
      set({ searchResults: [], isSearching: false });
      return;
    }
    set({ isSearching: true, error: null });
    try {
      const results = await socialService.searchUsers(query);
      set({ searchResults: results, isSearching: false });
    } catch (err) {
      set({ error: err.message, isSearching: false });
    }
  },

  fetchFriends: async () => {
    set({ isFriendsLoading: true });
    try {
      const friends = await socialService.getFriends();
      set({ friends, isFriendsLoading: false });
    } catch (err) {
      set({ error: err.message, isFriendsLoading: false });
    }
  },

  fetchFriendRequests: async () => {
    set({ isRequestsLoading: true });
    try {
      const requests = await socialService.getFriendRequests();
      set({ friendRequests: requests, isRequestsLoading: false });
    } catch (err) {
      set({ error: err.message, isRequestsLoading: false });
    }
  },

  fetchPendingChallenges: async () => {
    set({ isChallengesLoading: true });
    try {
      const challenges = await socialService.getPendingChallenges();
      set({ pendingChallenges: challenges, isChallengesLoading: false });
    } catch (err) {
      set({ error: err.message, isChallengesLoading: false });
    }
  },

  sendFriendRequest: async (targetUserId) => {
    set({ isActionLoading: true, error: null });
    try {
      await socialService.sendFriendRequest(targetUserId);
      set({
        successMessage: 'Friend request sent successfully!',
        isActionLoading: false,
      });
      get().fetchFriendRequests();
    } catch (err) {
      set({ error: err.message, isActionLoading: false });
      throw err;
    }
  },

  acceptFriendRequest: async (friendshipId) => {
    set({ isActionLoading: true, error: null });
    try {
      await socialService.acceptFriendRequest(friendshipId);
      set({
        successMessage: 'Friend request accepted!',
        isActionLoading: false,
      });
      get().fetchFriendRequests();
      get().fetchFriends();
    } catch (err) {
      set({ error: err.message, isActionLoading: false });
      throw err;
    }
  },

  declineFriendRequest: async (friendshipId) => {
    set({ isActionLoading: true, error: null });
    try {
      await socialService.declineFriendRequest(friendshipId);
      set({
        successMessage: 'Friend request declined',
        isActionLoading: false,
      });
      get().fetchFriendRequests();
    } catch (err) {
      set({ error: err.message, isActionLoading: false });
      throw err;
    }
  },

  removeFriend: async (friendshipId) => {
    set({ isActionLoading: true, error: null });
    try {
      await socialService.removeFriend(friendshipId);
      set({
        successMessage: 'Friend removed',
        isActionLoading: false,
      });
      get().fetchFriends();
    } catch (err) {
      set({ error: err.message, isActionLoading: false });
      throw err;
    }
  },

  createChallenge: async (targetUserId, timeControl, colorPreference) => {
    set({ isActionLoading: true, error: null });
    try {
      const challenge = await socialService.createChallenge(targetUserId, timeControl, colorPreference);
      set({
        successMessage: 'Challenge sent! Waiting for player to accept...',
        isActionLoading: false,
      });
      get().fetchPendingChallenges();
      return challenge;
    } catch (err) {
      set({ error: err.message, isActionLoading: false });
      throw err;
    }
  },

  acceptChallenge: async (challengeId) => {
    set({ isActionLoading: true, error: null });
    try {
      const response = await socialService.acceptChallenge(challengeId);
      set({
        successMessage: 'Challenge accepted! Entering battle...',
        isActionLoading: false,
      });
      get().fetchPendingChallenges();
      return response;
    } catch (err) {
      set({ error: err.message, isActionLoading: false });
      throw err;
    }
  },

  declineChallenge: async (challengeId) => {
    set({ isActionLoading: true, error: null });
    try {
      await socialService.declineChallenge(challengeId);
      set({
        successMessage: 'Challenge declined',
        isActionLoading: false,
      });
      get().fetchPendingChallenges();
    } catch (err) {
      set({ error: err.message, isActionLoading: false });
      throw err;
    }
  },

  updateBio: async (bio) => {
    set({ isActionLoading: true, error: null });
    try {
      const profile = await socialService.updateBio(bio);
      set({
        activeProfile: profile,
        successMessage: 'Bio updated successfully!',
        isActionLoading: false,
      });
      return profile;
    } catch (err) {
      set({ error: err.message, isActionLoading: false });
      throw err;
    }
  },

  fetchProfile: async (userIdOrUsername) => {
    set({ error: null });
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userIdOrUsername);
      const profile = isUUID
        ? await socialService.getUserProfile(userIdOrUsername)
        : await socialService.getUserProfileByUsername(userIdOrUsername);
      set({ activeProfile: profile });
      return profile;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  clearActiveProfile: () => set({ activeProfile: null }),
}));
