import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import {
  Zap,
  Clock,
  Hourglass,
  Trophy,
  Swords,
  Bot,
  Users,
  LineChart,
  Puzzle,
  ChevronRight,
  Flame,
  Award,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { useAuthStore } from '../store/useAuthStore';
import { useMultiplayerStore } from '../store/useMultiplayerStore';
import { puzzleService } from '../services/puzzleService';
import { tournamentService } from '../services/tournamentService';
import { socialService } from '../services/socialService';

const TIME_CONTROL_CHIPS = [
  { id: '1m', name: 'Bullet 1+0', time: '1 min', icon: Zap, color: 'text-amber-400' },
  { id: '3m', name: 'Blitz 3+0', time: '3 min', icon: Zap, color: 'text-amber-400' },
  { id: '5m', name: 'Blitz 5+0', time: '5 min', icon: Zap, color: 'text-[#7FB069]', popular: true },
  { id: '10m', name: 'Rapid 10+0', time: '10 min', icon: Clock, color: 'text-sky-400' },
  { id: '15m', name: 'Rapid 15+10', time: '15 min', icon: Clock, color: 'text-sky-400' },
  { id: '30m', name: 'Classical 30+0', time: '30 min', icon: Hourglass, color: 'text-purple-400' },
];

export const LandingPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { startSearch } = useMultiplayerStore();

  const [dailyPuzzle, setDailyPuzzle] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadOverviewData = async () => {
      try {
        const [puzzleRes, tourRes, lbRes] = await Promise.allSettled([
          puzzleService.getDailyPuzzle(),
          tournamentService.getTournaments(),
          socialService.getLeaderboard(),
        ]);

        if (isMounted) {
          if (puzzleRes.status === 'fulfilled' && puzzleRes.value) {
            setDailyPuzzle(puzzleRes.value);
          }
          if (tourRes.status === 'fulfilled' && tourRes.value?.data) {
            setTournaments(tourRes.value.data.slice(0, 3));
          }
          if (lbRes.status === 'fulfilled' && Array.isArray(lbRes.value)) {
            setLeaderboard(lbRes.value.slice(0, 5));
          }
        }
      } catch (err) {
        console.warn('Overview data fetch warning:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadOverviewData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleQuickPlay = (timeControlId) => {
    startSearch(timeControlId);
    navigate('/play');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Hero Grid: Quick Play + Daily Puzzle */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Hero: Quick Play Card (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl border border-[#21262D] bg-[#161B22] p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#7FB069]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#7FB069]/20 text-[#7FB069]">
                <Swords className="h-3.5 w-3.5" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#7FB069]">
                Online Arena
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F0F6FC] leading-tight">
              Play Chess Online <br />
              <span className="text-[#7FB069]">With Real Players</span>
            </h1>

            <p className="text-sm text-[#8B949E] max-w-lg leading-relaxed">
              Match instantly by time control. Server-validated moves, WebSocket heartbeats,
              and smooth low-latency clocks.
            </p>
          </div>

          {/* Time Control Chips Grid */}
          <div className="mt-8 space-y-3 relative z-10">
            <p className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider">
              Quick Pairing Time Controls
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {TIME_CONTROL_CHIPS.map((tc) => {
                const Icon = tc.icon;
                return (
                  <button
                    key={tc.id}
                    onClick={() => handleQuickPlay(tc.id)}
                    className="group relative flex flex-col items-center justify-center p-3 rounded-xl bg-[#0E1116] border border-[#21262D] hover:border-[#7FB069] hover:bg-[#1F242C] transition-all duration-150 cursor-pointer text-center"
                  >
                    {tc.popular && (
                      <span className="absolute -top-2 px-1.5 py-0.2 rounded-full bg-[#7FB069] text-[#0E1116] text-[9px] font-bold uppercase tracking-wider shadow-sm">
                        Popular
                      </span>
                    )}
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className={`h-4 w-4 ${tc.color} group-hover:scale-110 transition-transform`} />
                      <span className="text-xs font-bold text-[#F0F6FC] group-hover:text-[#7FB069] transition-colors">
                        {tc.name}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-[#8B949E]">
                      {tc.time}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Hero: Daily Puzzle Preview Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-[#21262D] bg-[#161B22] p-6 shadow-xl relative">
          <div className="flex items-center justify-between pb-3 border-b border-[#21262D]">
            <div className="flex items-center gap-2">
              <Puzzle className="h-5 w-5 text-[#7FB069]" />
              <h2 className="text-base font-bold text-[#F0F6FC]">Daily Puzzle</h2>
            </div>
            {dailyPuzzle && (
              <Badge variant="success" size="sm">
                Rating {dailyPuzzle.rating || 1500}
              </Badge>
            )}
          </div>

          <div className="my-4 flex flex-col items-center justify-center">
            <div className="w-[200px] h-[200px] sm:w-[220px] sm:h-[220px] rounded-xl overflow-hidden shadow-md border border-[#21262D] pointer-events-none">
              <Chessboard
                position={dailyPuzzle?.fen || 'r1bqk2r/pppp1ppp/2n5/4p3/1bB1n3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 6'}
                boardWidth={220}
                arePiecesDraggable={false}
                customDarkSquareStyle={{ backgroundColor: '#B58863' }}
                customLightSquareStyle={{ backgroundColor: '#F0D9B5' }}
              />
            </div>
            <p className="mt-3 text-xs text-[#8B949E] text-center max-w-xs">
              {dailyPuzzle?.theme ? `Theme: ${dailyPuzzle.theme}` : 'Sharpen your tactics with daily masterclass positions.'}
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            className="w-full"
            onClick={() => navigate('/puzzles')}
          >
            Solve Daily Puzzle
          </Button>
        </div>
      </div>

      {/* Secondary Modes Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card
          hoverLift
          onClick={() => navigate('/ai')}
          className="cursor-pointer group border-[#21262D] flex items-center gap-4"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-105 transition-transform">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#F0F6FC] group-hover:text-indigo-400 transition-colors">
              Play vs Computer
            </h3>
            <p className="text-xs text-[#8B949E] mt-0.5">
              Multi-depth bots calculated smoothly via background Web Worker.
            </p>
          </div>
        </Card>

        <Card
          hoverLift
          onClick={() => navigate('/local')}
          className="cursor-pointer group border-[#21262D] flex items-center gap-4"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-105 transition-transform">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#F0F6FC] group-hover:text-amber-400 transition-colors">
              Pass &amp; Play
            </h3>
            <p className="text-xs text-[#8B949E] mt-0.5">
              Local 2-player mode with flip-board and configurable clocks.
            </p>
          </div>
        </Card>

        <Card
          hoverLift
          onClick={() => navigate('/analysis')}
          className="cursor-pointer group border-[#21262D] flex items-center gap-4"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-[#7FB069] group-hover:scale-105 transition-transform">
            <LineChart className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#F0F6FC] group-hover:text-[#7FB069] transition-colors">
              Deep Analysis
            </h3>
            <p className="text-xs text-[#8B949E] mt-0.5">
              Explore FEN/PGN lines, evaluation charts, and branch trees.
            </p>
          </div>
        </Card>
      </div>

      {/* Bottom Grid: Tournaments List & Live Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Tournaments (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-[#21262D] bg-[#161B22] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#21262D]">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-400" />
              <h2 className="text-base font-bold text-[#F0F6FC]">Active Tournaments</h2>
            </div>
            <button
              onClick={() => navigate('/tournaments')}
              className="text-xs text-[#7FB069] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>View All</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : tournaments.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#8B949E]">
              No active tournaments at the moment. Create one to begin competing!
            </div>
          ) : (
            <div className="space-y-3">
              {tournaments.map((t) => (
                <div
                  key={t.id}
                  onClick={() => navigate('/tournaments')}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#0E1116] border border-[#21262D] hover:border-[#30363D] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 font-bold">
                      🏆
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#F0F6FC]">{t.name}</h4>
                      <p className="text-[11px] text-[#8B949E] mt-0.5">
                        {t.timeControl || '5m Blitz'} &bull; {t.participantCount || t.participants?.length || 0} players
                      </p>
                    </div>
                  </div>
                  <Badge variant={t.status === 'IN_PROGRESS' ? 'live' : 'neutral'} size="sm">
                    {t.status || 'UPCOMING'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Leaderboard Snippet (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-[#21262D] bg-[#161B22] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#21262D]">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-[#7FB069]" />
              <h2 className="text-base font-bold text-[#F0F6FC]">Top Arena Masters</h2>
            </div>
            <button
              onClick={() => navigate('/social')}
              className="text-xs text-[#7FB069] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Rankings</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#8B949E]">
              Play rated matches to climb the global rankings.
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((player, idx) => (
                <div
                  key={player.id || idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#0E1116] border border-[#21262D]"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-5 text-center text-xs font-bold font-mono ${
                      idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-amber-600' : 'text-[#8B949E]'
                    }`}>
                      #{idx + 1}
                    </span>
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1F242C] text-xs font-bold text-[#7FB069]">
                      {player.username?.charAt(0).toUpperCase() || 'P'}
                    </div>
                    <span className="text-xs font-semibold text-[#F0F6FC]">
                      {player.username}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#7FB069]">
                    {player.rating || 1500}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
