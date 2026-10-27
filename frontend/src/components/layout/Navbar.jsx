import React from 'react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/useAuthStore';

export const Navbar = ({
  backendHealthy,
  onRefreshHealth,
  isCheckingHealth,
  currentView,
  onNavigate,
}) => {
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#262c3b] bg-[#0b0e14]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#69923e] text-white shadow-sm font-bold text-lg">
            ♞
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white hover:text-gray-200">
                Chess Arena
              </span>
            </div>
            <p className="text-[11px] text-gray-400 hidden sm:block">Full-Stack Chess Platform</p>
          </div>
        </div>

        {/* Center / Navigation Links */}
        <nav className="flex items-center gap-1.5">
          <button
            onClick={() => onNavigate('landing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              currentView === 'landing'
                ? 'bg-[#1c212c] text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onNavigate('tournaments')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              currentView === 'tournaments'
                ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20'
                : 'text-amber-400 hover:bg-[#151921] hover:text-amber-300'
            }`}
          >
            <span>🏆</span> Tournaments
          </button>
          <button
            onClick={() => onNavigate('puzzles')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              currentView === 'puzzles'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-purple-400 hover:bg-[#151921] hover:text-purple-300'
            }`}
          >
            <span>🧩</span> Puzzles
          </button>
          <button
            onClick={() => onNavigate('social')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              currentView === 'social'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-amber-400 hover:bg-[#151921] hover:text-amber-300'
            }`}
          >
            <span>👥</span> Social
          </button>
          <button
            onClick={() => onNavigate('analysis')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              currentView === 'analysis'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-400 hover:bg-[#151921] hover:text-emerald-300'
            }`}
          >
            <span>📊</span> Analysis
          </button>
          <button
            onClick={() => onNavigate('play-ai')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              currentView === 'play-ai'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>🤖</span> Play vs AI
          </button>
          <button
            onClick={() => onNavigate('play-online')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              currentView === 'play-online'
                ? 'bg-[#69923e] text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>⚔️</span> Online
          </button>
          <button
            onClick={() => onNavigate('play')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              currentView === 'play'
                ? 'bg-[#1c212c] text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>♟️</span> Pass &amp; Play
          </button>
          <button
            onClick={() => onNavigate('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              currentView === 'history'
                ? 'bg-[#1c212c] text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>📜</span> History
          </button>
          <button
            onClick={() => onNavigate('monitoring')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              currentView === 'monitoring'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-400 hover:bg-[#151921] hover:text-emerald-300'
            }`}
          >
            <span>⚡</span> Telemetry
          </button>
        </nav>

        {/* Right / Status & Auth */}
        <div className="flex items-center gap-3">
          {/* Health Badge */}
          <div className="hidden lg:flex items-center gap-2">
            {backendHealthy === null ? (
              <Badge variant="neutral" dot size="sm">
                Checking...
              </Badge>
            ) : backendHealthy ? (
              <Badge variant="success" dot size="sm">
                API Active (:8080)
              </Badge>
            ) : (
              <Badge variant="danger" dot size="sm">
                API Offline
              </Badge>
            )}
          </div>

          {/* User Controls */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg bg-[#151921] border border-[#262c3b] px-2.5 py-1.5">
                <div className="h-6 w-6 rounded-full bg-[#69923e] text-white flex items-center justify-center text-xs font-bold uppercase">
                  {user.username.charAt(0)}
                </div>
                <div className="flex flex-col hidden sm:flex">
                  <span className="text-xs font-medium text-white leading-none">
                    {user.username}
                  </span>
                  <span className="text-[10px] text-emerald-400 leading-none mt-0.5">
                    {user.role}
                  </span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-xs text-gray-400 hover:text-red-400"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('login')}
                className="text-xs"
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onNavigate('register')}
                className="text-xs"
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
