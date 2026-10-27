import React, { useState, useEffect } from 'react';
import { useSocialStore } from '../store/useSocialStore';
import { useAuthStore } from '../store/useAuthStore';
import { ChallengeModal } from '../components/social/ChallengeModal';
import { UserProfileModal } from '../components/social/UserProfileModal';
import { Button } from '../components/ui/Button';

export const SocialPage = ({ onNavigateToPlayOnline, onNavigateToAuth }) => {
  const { user, isAuthenticated } = useAuthStore();
  const {
    leaderboard,
    friends,
    friendRequests,
    pendingChallenges,
    searchResults,
    activeProfile,
    isLeaderboardLoading,
    isFriendsLoading,
    isRequestsLoading,
    isChallengesLoading,
    isSearching,
    isActionLoading,
    error,
    successMessage,
    clearMessages,
    fetchLeaderboard,
    fetchOverview,
    searchUsers,
    fetchFriends,
    fetchFriendRequests,
    fetchPendingChallenges,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    createChallenge,
    acceptChallenge,
    declineChallenge,
    updateBio,
    fetchProfile,
    clearActiveProfile,
  } = useSocialStore();

  const [activeTab, setActiveTab] = useState('leaderboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChallengeUser, setSelectedChallengeUser] = useState(null);
  const [isBioEditing, setIsBioEditing] = useState(false);
  const [bioInput, setBioInput] = useState(user?.bio || '');

  useEffect(() => {
    fetchLeaderboard();
    if (isAuthenticated) {
      fetchOverview();
    }
  }, [isAuthenticated, fetchLeaderboard, fetchOverview]);

  useEffect(() => {
    if (user?.bio) {
      setBioInput(user.bio);
    }
  }, [user]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers(searchQuery);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, searchUsers]);

  // Clear toast messages after 4 seconds
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        clearMessages();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error, clearMessages]);

  const handleSendChallenge = async (targetUserId, timeControl, colorPreference) => {
    try {
      await createChallenge(targetUserId, timeControl, colorPreference);
      setSelectedChallengeUser(null);
      setActiveTab('challenges');
    } catch {
      // error handled in store
    }
  };

  const handleAcceptChallenge = async (challengeId) => {
    try {
      const res = await acceptChallenge(challengeId);
      if (onNavigateToPlayOnline) {
        onNavigateToPlayOnline(res?.gameId);
      }
    } catch {
      // error handled in store
    }
  };

  const handleSaveBio = async (e) => {
    e.preventDefault();
    try {
      await updateBio(bioInput);
      setIsBioEditing(false);
    } catch {
      // error handled in store
    }
  };

  const incomingRequests = friendRequests.filter((r) => !r.isRequester);
  const outgoingRequests = friendRequests.filter((r) => r.isRequester);
  const incomingChallenges = pendingChallenges.filter((c) => !c.isChallenger);
  const outgoingChallenges = pendingChallenges.filter((c) => c.isChallenger);

  const getRankBadge = (rank) => {
    if (rank === 1) return <span className="text-xl" title="1st Place">🥇</span>;
    if (rank === 2) return <span className="text-xl" title="2nd Place">🥈</span>;
    if (rank === 3) return <span className="text-xl" title="3rd Place">🥉</span>;
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1c2436] text-xs font-bold text-gray-400">
        #{rank}
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Toast Notifications */}
      {successMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-emerald-600/90 border border-emerald-400 px-4 py-3 text-sm font-semibold text-white shadow-xl backdrop-blur-md animate-in slide-in-from-bottom duration-200">
          ✓ {successMessage}
        </div>
      )}
      {error && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-red-600/90 border border-red-400 px-4 py-3 text-sm font-semibold text-white shadow-xl backdrop-blur-md animate-in slide-in-from-bottom duration-200">
          ⚠ {error}
        </div>
      )}

      {/* Header Banner */}
      <div className="mb-8 rounded-3xl border border-[#232b3d] bg-gradient-to-r from-[#121622] via-[#161c2c] to-[#0f131c] p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-600 text-white font-extrabold text-2xl shadow-lg ring-4 ring-[#1f2638]">
              {user?.username ? user.username.charAt(0).toUpperCase() : '♞'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {isAuthenticated ? user?.username : 'Chess Arena Community'}
                </h1>
                {isAuthenticated && (
                  <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-0.5 text-xs font-bold text-amber-400">
                    {user?.rating || 1200} ELO
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                {isAuthenticated
                  ? (user?.bio || 'Chess enthusiast playing on Chess Arena')
                  : 'Compete on the global leaderboard, challenge friends, and track your chess journey.'}
              </p>
            </div>
          </div>

          {isAuthenticated ? (
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsBioEditing(!isBioEditing)}
                className="border-[#2b354a] hover:bg-[#1f2638] text-gray-300 text-xs"
              >
                ✏️ {isBioEditing ? 'Cancel Edit' : 'Edit Bio'}
              </Button>
              <div className="flex items-center gap-2 rounded-xl bg-[#1b2234] border border-[#273248] px-3.5 py-2">
                <span className="text-xs text-gray-400">Record:</span>
                <span className="text-xs font-bold text-emerald-400">{user?.gamesWon || 0}W</span>
                <span className="text-xs text-gray-500">-</span>
                <span className="text-xs font-bold text-red-400">{user?.gamesLost || 0}L</span>
              </div>
            </div>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={onNavigateToAuth}
              className="bg-[#69923e] hover:bg-[#5b8035] text-white font-semibold"
            >
              Sign In to Connect
            </Button>
          )}
        </div>

        {/* Inline Bio Editing Form */}
        {isBioEditing && (
          <form onSubmit={handleSaveBio} className="mt-5 pt-4 border-t border-[#202738] flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              maxLength={250}
              value={bioInput}
              onChange={(e) => setBioInput(e.target.value)}
              placeholder="Write a short chess bio or quote..."
              className="flex-1 rounded-xl bg-[#0f131c] border border-[#2b354a] px-3.5 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#69923e]"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isActionLoading}
              className="bg-[#69923e] hover:bg-[#5b8035] text-white"
            >
              Save Bio
            </Button>
          </form>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-[#232b3d] pb-3">
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'leaderboard'
              ? 'bg-[#1e2536] text-amber-400 border border-amber-500/30 shadow-sm'
              : 'text-gray-400 hover:text-white hover:bg-[#141924]'
          }`}
        >
          <span>🏆</span> Leaderboard
        </button>

        {isAuthenticated && (
          <>
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'friends'
                  ? 'bg-[#1e2536] text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-[#141924]'
              }`}
            >
              <span>👥</span> Friends
              <span className="rounded-full bg-[#2a344d] px-2 py-0.2 text-[10px] text-gray-300">
                {friends.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('requests')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'requests'
                  ? 'bg-[#1e2536] text-blue-400 border border-blue-500/30 shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-[#141924]'
              }`}
            >
              <span>📩</span> Requests
              {incomingRequests.length > 0 && (
                <span className="rounded-full bg-blue-500 px-2 py-0.2 text-[10px] font-extrabold text-white">
                  {incomingRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('challenges')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'challenges'
                  ? 'bg-[#1e2536] text-purple-400 border border-purple-500/30 shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-[#141924]'
              }`}
            >
              <span>⚔️</span> Challenges
              {incomingChallenges.length > 0 && (
                <span className="rounded-full bg-purple-500 px-2 py-0.2 text-[10px] font-extrabold text-white animate-pulse">
                  {incomingChallenges.length}
                </span>
              )}
            </button>
          </>
        )}

        <button
          onClick={() => setActiveTab('search')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'search'
              ? 'bg-[#1e2536] text-indigo-400 border border-indigo-500/30 shadow-sm'
              : 'text-gray-400 hover:text-white hover:bg-[#141924]'
          }`}
        >
          <span>🔍</span> Find Players
        </button>
      </div>

      {/* TAB 1: LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <div className="rounded-2xl border border-[#232b3d] bg-[#121622] overflow-hidden shadow-xl">
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#1f2638] bg-[#141926]">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>🏆</span> Global Top 50 Leaderboard
              </h2>
              <p className="text-xs text-gray-400">Ranked by Elo rating from competitive matches</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchLeaderboard}
              disabled={isLeaderboardLoading}
              className="text-xs text-gray-400 hover:text-white"
            >
              🔄 Refresh
            </Button>
          </div>

          {isLeaderboardLoading ? (
            <div className="py-20 text-center text-gray-400">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
              <p className="mt-2 text-xs">Loading leaderboard...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              <p className="text-base font-semibold">No ranked players found</p>
              <p className="text-xs mt-1">Play matches to claim the top spot on the leaderboard!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#1f2638] text-[11px] uppercase tracking-wider text-gray-400 bg-[#0f131c]">
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Player</th>
                    <th className="py-3 px-4">Rating</th>
                    <th className="py-3 px-4">Win Rate</th>
                    <th className="py-3 px-4">Games</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1b2130]">
                  {leaderboard.map((player) => {
                    const isSelf = user?.id === player.id;
                    const isFriend = friends.some((f) => f.friendId === player.id);

                    return (
                      <tr
                        key={player.id}
                        className={`transition-colors hover:bg-[#181f2f] ${
                          isSelf ? 'bg-[#1b253b]/40 ring-1 ring-amber-500/20' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 font-bold">
                          {getRankBadge(player.rank)}
                        </td>
                        <td className="py-3.5 px-4">
                          <div
                            onClick={() => fetchProfile(player.id)}
                            className="flex items-center gap-3 cursor-pointer group"
                          >
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                              {player.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-white group-hover:text-amber-400 transition-colors">
                                  {player.username}
                                </span>
                                {isSelf && (
                                  <span className="rounded bg-amber-400/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.2">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-400 truncate max-w-xs">
                                {player.bio || 'Chess Arena player'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-lg text-xs">
                            {player.rating}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white text-xs">
                              {player.winRate}%
                            </span>
                            <div className="h-1.5 w-16 rounded-full bg-[#202738] overflow-hidden hidden sm:block">
                              <div
                                style={{ width: `${player.winRate}%` }}
                                className="h-full bg-emerald-500"
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-gray-300 font-medium">
                          {player.gamesPlayed} ({player.gamesWon}W / {player.gamesLost}L)
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => fetchProfile(player.id)}
                              className="text-xs text-gray-400 hover:text-white px-2 py-1"
                              title="Inspect Profile"
                            >
                              👁️
                            </Button>
                            {isAuthenticated && !isSelf && (
                              <>
                                {!isFriend && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => sendFriendRequest(player.id)}
                                    className="border-[#2b354a] hover:bg-[#20293d] text-gray-300 text-xs px-2.5 py-1"
                                    title="Add Friend"
                                  >
                                    ➕
                                  </Button>
                                )}
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => setSelectedChallengeUser(player)}
                                  className="bg-amber-600 hover:bg-amber-500 text-white text-xs px-2.5 py-1 font-semibold flex items-center gap-1"
                                >
                                  <span>⚔️</span> Challenge
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FRIENDS */}
      {activeTab === 'friends' && (
        <div className="rounded-2xl border border-[#232b3d] bg-[#121622] p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-[#1f2638] mb-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>👥</span> My Friends ({friends.length})
              </h2>
              <p className="text-xs text-gray-400">Play matches and challenge your chess allies</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('search')}
              className="border-[#2b354a] text-gray-300 hover:text-white text-xs"
            >
              🔍 Find New Friends
            </Button>
          </div>

          {isFriendsLoading ? (
            <div className="py-16 text-center text-gray-400">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            </div>
          ) : friends.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <span className="text-4xl">♟️</span>
              <p className="text-base font-semibold text-gray-300 mt-3">No friends added yet</p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                Search for fellow players by username or browse the leaderboard to send friend requests!
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setActiveTab('search')}
                className="mt-4 bg-[#69923e] hover:bg-[#5b8035] text-white"
              >
                Search Players
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends.map((f) => (
                <div
                  key={f.id}
                  className="rounded-2xl border border-[#232d42] bg-[#161c2a] p-4 flex flex-col justify-between hover:border-gray-500 transition-all shadow-sm"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      {f.friendUsername.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white truncate text-sm">
                          {f.friendUsername}
                        </span>
                        <span className="rounded bg-amber-400/10 border border-amber-400/20 px-2 py-0.2 text-[10px] font-bold text-amber-400">
                          {f.friendRating} ELO
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 truncate mt-1">
                        {f.friendBio || 'Ready for a match'}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-[11px] text-gray-400 font-medium">
                        <span>Win Rate: {f.friendWinRate}%</span>
                        <span>•</span>
                        <span>{f.friendGamesPlayed} games</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-[#1f2638]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFriend(f.id)}
                      className="text-xs text-red-400/80 hover:text-red-300 hover:bg-red-500/10 px-2 py-1"
                    >
                      Remove
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        setSelectedChallengeUser({
                          id: f.friendId,
                          username: f.friendUsername,
                          rating: f.friendRating,
                          bio: f.friendBio,
                        })
                      }
                      className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center gap-1.5"
                    >
                      <span>⚔️</span> Challenge
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: FRIEND REQUESTS */}
      {activeTab === 'requests' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Incoming */}
          <div className="rounded-2xl border border-[#232b3d] bg-[#121622] p-5 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4 pb-3 border-b border-[#1f2638]">
              <span>📥</span> Incoming Requests ({incomingRequests.length})
            </h3>
            {incomingRequests.length === 0 ? (
              <p className="text-xs text-gray-500 py-8 text-center">No incoming requests</p>
            ) : (
              <div className="space-y-3">
                {incomingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="rounded-xl border border-[#232d42] bg-[#161c2a] p-3.5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                        {req.friendUsername.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold text-white text-sm">
                          {req.friendUsername}
                        </span>
                        <p className="text-xs text-amber-400 font-medium">{req.friendRating} ELO</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => acceptFriendRequest(req.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1 font-semibold"
                      >
                        Accept
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => declineFriendRequest(req.id)}
                        className="text-xs text-gray-400 hover:text-red-400"
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outgoing */}
          <div className="rounded-2xl border border-[#232b3d] bg-[#121622] p-5 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4 pb-3 border-b border-[#1f2638]">
              <span>📤</span> Sent Requests ({outgoingRequests.length})
            </h3>
            {outgoingRequests.length === 0 ? (
              <p className="text-xs text-gray-500 py-8 text-center">No pending outgoing requests</p>
            ) : (
              <div className="space-y-3">
                {outgoingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="rounded-xl border border-[#232d42] bg-[#161c2a] p-3.5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                        {req.friendUsername.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold text-white text-sm">
                          {req.friendUsername}
                        </span>
                        <p className="text-xs text-gray-400">Waiting for response...</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => declineFriendRequest(req.id)}
                      className="text-xs text-gray-400 hover:text-red-400"
                    >
                      Cancel
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: CHALLENGES */}
      {activeTab === 'challenges' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Incoming Challenges */}
          <div className="rounded-2xl border border-[#232b3d] bg-[#121622] p-5 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4 pb-3 border-b border-[#1f2638]">
              <span>⚔️</span> Incoming Challenges ({incomingChallenges.length})
            </h3>
            {incomingChallenges.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <p className="text-xs">No pending challenges received</p>
              </div>
            ) : (
              <div className="space-y-3">
                {incomingChallenges.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-xl border border-amber-500/30 bg-[#191f2e] p-4 shadow-md"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold text-lg">
                          ⚔️
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">
                              {c.challengerUsername}
                            </span>
                            <span className="rounded bg-amber-400/10 text-amber-400 text-[10px] font-bold px-1.5 py-0.2">
                              {c.challengerRating} ELO
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Time: <span className="text-white font-semibold">{c.timeControl}</span> • Color: <span className="text-white font-semibold">{c.colorPreference}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#232b3d]">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => declineChallenge(c.id)}
                        className="text-xs text-gray-400 hover:text-red-400"
                      >
                        Decline
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAcceptChallenge(c.id)}
                        className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 px-3 py-1.5"
                      >
                        <span>⚔️</span> Accept &amp; Play!
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outgoing Challenges */}
          <div className="rounded-2xl border border-[#232b3d] bg-[#121622] p-5 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4 pb-3 border-b border-[#1f2638]">
              <span>📤</span> Sent Challenges ({outgoingChallenges.length})
            </h3>
            {outgoingChallenges.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <p className="text-xs">No active challenges sent</p>
              </div>
            ) : (
              <div className="space-y-3">
                {outgoingChallenges.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-xl border border-[#232d42] bg-[#161c2a] p-3.5 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">
                          vs {c.challengedUsername}
                        </span>
                        <span className="rounded bg-gray-700 text-gray-300 text-[10px] font-bold px-1.5 py-0.2">
                          {c.challengedRating} ELO
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {c.timeControl} • {c.colorPreference} • <span className="text-amber-400">Waiting for response...</span>
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => declineChallenge(c.id)}
                      className="text-xs text-gray-400 hover:text-red-400"
                    >
                      Cancel
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: SEARCH PLAYERS */}
      {activeTab === 'search' && (
        <div className="rounded-2xl border border-[#232b3d] bg-[#121622] p-6 shadow-xl">
          <div className="mb-6 max-w-xl mx-auto text-center">
            <h2 className="text-xl font-bold text-white mb-2">Find &amp; Challenge Players</h2>
            <p className="text-xs text-gray-400 mb-4">
              Search by username to connect with other players across the platform
            </p>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type a username..."
                className="w-full rounded-2xl bg-[#161c28] border border-[#2b354a] px-5 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#69923e] ring-1 ring-transparent focus:ring-[#69923e]/20"
              />
              {isSearching && (
                <div className="absolute right-4 top-3.5 h-5 w-5 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
              )}
            </div>
          </div>

          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((p) => {
                const isSelf = user?.id === p.id;
                const isFriend = friends.some((f) => f.friendId === p.id);

                return (
                  <div
                    key={p.id}
                    className="rounded-2xl border border-[#232d42] bg-[#161c2a] p-4 flex flex-col justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                        {p.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white truncate text-sm">
                            {p.username}
                          </span>
                          <span className="rounded bg-amber-400/10 text-amber-400 text-[10px] font-bold px-1.5 py-0.2">
                            {p.rating || 1200} ELO
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 truncate mt-1">
                          {p.bio || 'Chess Arena player'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-[#1f2638]">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fetchProfile(p.id)}
                        className="text-xs text-gray-400 hover:text-white"
                      >
                        Profile
                      </Button>
                      {isAuthenticated && !isSelf && (
                        <>
                          {!isFriend && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => sendFriendRequest(p.id)}
                              className="border-[#2b354a] text-gray-300 text-xs px-2.5 py-1"
                            >
                              Add Friend
                            </Button>
                          )}
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setSelectedChallengeUser(p)}
                            className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs px-2.5 py-1 flex items-center gap-1"
                          >
                            <span>⚔️</span> Challenge
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : searchQuery.trim() ? (
            <p className="text-center text-xs text-gray-500 py-10">No players found matching "{searchQuery}"</p>
          ) : (
            <div className="text-center py-10 text-gray-500">
              <span className="text-3xl">👥</span>
              <p className="text-xs mt-2">Start typing above to search for players</p>
            </div>
          )}
        </div>
      )}

      {/* Challenge Modal */}
      <ChallengeModal
        targetUser={selectedChallengeUser}
        isOpen={!!selectedChallengeUser}
        onClose={() => setSelectedChallengeUser(null)}
        onSendChallenge={handleSendChallenge}
        isLoading={isActionLoading}
      />

      {/* Profile Inspect Modal */}
      <UserProfileModal
        profile={activeProfile}
        isOpen={!!activeProfile}
        onClose={clearActiveProfile}
        onChallenge={(prof) => {
          clearActiveProfile();
          setSelectedChallengeUser(prof);
        }}
        onAddFriend={(targetId) => {
          sendFriendRequest(targetId);
          clearActiveProfile();
        }}
        isFriend={friends.some((f) => f.friendId === activeProfile?.id)}
        isSelf={user?.id === activeProfile?.id}
      />
    </div>
  );
};
