import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Swords,
  Bot,
  Users,
  Puzzle,
  Trophy,
  LineChart,
  Users2,
  History,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  LogOut,
  LogIn,
  UserPlus,
  Settings,
  Volume2,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const Sidebar = ({ isCollapsed, onToggleCollapse, backendHealthy }) => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';

  const navItems = [
    { to: '/play', label: 'Play Online', icon: Swords },
    { to: '/ai', label: 'Play Computer', icon: Bot },
    { to: '/local', label: 'Pass & Play', icon: Users },
    { to: '/puzzles', label: 'Puzzles', icon: Puzzle },
    { to: '/tournaments', label: 'Tournaments', icon: Trophy },
    { to: '/analysis', label: 'Analysis', icon: LineChart },
    { to: '/social', label: 'Community', icon: Users2 },
    { to: '/history', label: 'History', icon: History },
  ];

  if (isAdmin) {
    navItems.push({ to: '/monitoring', label: 'Telemetry', icon: ShieldAlert });
  }

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-[#21262D] bg-[#161B22] text-[#F0F6FC] transition-all duration-200 z-30 select-none ${
        isCollapsed ? 'w-[72px]' : 'w-[240px]'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-[#21262D]">
        <NavLink
          to="/"
          className="flex items-center gap-3 overflow-hidden group focus:outline-none"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#7FB069] text-[#0E1116] shadow-md font-bold text-xl transition-transform group-hover:scale-105">
            ♞
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-base tracking-tight text-[#F0F6FC] group-hover:text-white transition-colors">
                Chess Arena
              </span>
              <div className="flex items-center gap-1.5 text-[11px] text-[#8B949E]">
                <span
                  className={`inline-block h-1.5 w-1.5 rounded-full ${
                    backendHealthy === true
                      ? 'bg-[#7FB069]'
                      : backendHealthy === false
                      ? 'bg-rose-500'
                      : 'bg-amber-400 animate-pulse'
                  }`}
                />
                <span className="truncate">
                  {backendHealthy === true
                    ? 'Connected'
                    : backendHealthy === false
                    ? 'Offline'
                    : 'Connecting...'}
                </span>
              </div>
            </div>
          )}
        </NavLink>

        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-lg text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#1F242C] transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse to rail'}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#7FB069]/15 text-[#7FB069] font-semibold shadow-sm'
                    : 'text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#1F242C]'
                } ${isCollapsed ? 'justify-center px-0' : ''}`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Profile / Auth Card */}
      <div className="p-3 border-t border-[#21262D] bg-[#12161E]">
        {isAuthenticated && user ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1F242C] border border-[#21262D] text-sm font-bold text-[#7FB069]">
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col truncate">
                  <span className="text-xs font-semibold text-[#F0F6FC] truncate">
                    {user.username}
                  </span>
                  <span className="text-[11px] font-mono text-[#7FB069]">
                    {user.rating || 1200} ELO
                  </span>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-[#8B949E] hover:text-rose-400 hover:bg-[#1F242C] transition-colors"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {!isCollapsed ? (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#7FB069] hover:bg-[#90C27A] text-[#0E1116] text-xs font-semibold shadow-sm transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg bg-[#1F242C] hover:bg-[#282E37] text-[#8B949E] hover:text-[#F0F6FC] text-xs font-medium border border-[#21262D] transition-colors"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Register</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="flex items-center justify-center p-2 rounded-lg text-[#7FB069] hover:bg-[#1F242C]"
                title="Sign In"
              >
                <LogIn className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
