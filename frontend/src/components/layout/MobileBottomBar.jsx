import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Swords,
  Puzzle,
  Trophy,
  Users2,
  Menu,
  X,
  Bot,
  Users,
  LineChart,
  History,
  ShieldAlert,
  LogIn,
  LogOut,
  UserPlus,
  Home,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const MobileBottomBar = ({ backendHealthy }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';

  const primaryTabs = [
    { to: '/play', label: 'Play', icon: Swords },
    { to: '/puzzles', label: 'Puzzles', icon: Puzzle },
    { to: '/tournaments', label: 'Events', icon: Trophy },
    { to: '/social', label: 'Community', icon: Users2 },
  ];

  const secondaryLinks = [
    { to: '/', label: 'Home Overview', icon: Home },
    { to: '/ai', label: 'Play Computer', icon: Bot },
    { to: '/local', label: 'Pass & Play', icon: Users },
    { to: '/analysis', label: 'Game Analysis', icon: LineChart },
    { to: '/history', label: 'Game History', icon: History },
  ];

  if (isAdmin) {
    secondaryLinks.push({ to: '/monitoring', label: 'Admin Telemetry', icon: ShieldAlert });
  }

  const handleLinkClick = () => {
    setDrawerOpen(false);
  };

  return (
    <>
      {/* 5-Tab Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around h-16 bg-[#161B22]/95 backdrop-blur-md border-t border-[#21262D] px-2">
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                  isActive ? 'text-[#7FB069] font-medium' : 'text-[#8B949E] hover:text-[#F0F6FC]'
                }`
              }
            >
              <Icon className="h-5 w-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </NavLink>
          );
        })}

        <button
          onClick={() => setDrawerOpen(true)}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            drawerOpen ? 'text-[#7FB069]' : 'text-[#8B949E] hover:text-[#F0F6FC]'
          }`}
        >
          <Menu className="h-5 w-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">More</span>
        </button>
      </nav>

      {/* Slide-out Drawer for Secondary Links */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end animate-fade-in"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="w-4/5 max-w-xs h-full bg-[#161B22] border-l border-[#21262D] p-5 flex flex-col shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#21262D]">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7FB069] text-[#0E1116] font-bold text-base">
                  ♞
                </div>
                <span className="font-bold text-sm text-[#F0F6FC]">Menu &amp; Modes</span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1 rounded-lg text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#1F242C]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* User Profile or Login Status */}
            <div className="py-4 border-b border-[#21262D]">
              {isAuthenticated && user ? (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1F242C] border border-[#21262D] text-base font-bold text-[#7FB069]">
                    {user.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-sm font-semibold text-[#F0F6FC] truncate">
                      {user.username}
                    </span>
                    <span className="text-xs font-mono text-[#7FB069]">
                      {user.rating || 1200} ELO
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setDrawerOpen(false);
                      navigate('/login');
                    }}
                    className="flex-1 py-2 px-3 rounded-lg bg-[#7FB069] text-[#0E1116] text-xs font-semibold text-center"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setDrawerOpen(false);
                      navigate('/register');
                    }}
                    className="flex-1 py-2 px-3 rounded-lg bg-[#1F242C] text-[#F0F6FC] text-xs font-medium border border-[#21262D] text-center"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>

            {/* Links List */}
            <div className="flex-1 py-4 space-y-1">
              {secondaryLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[#7FB069]/15 text-[#7FB069] font-semibold'
                          : 'text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#1F242C]'
                      }`
                    }
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span>{link.label}</span>
                  </NavLink>
                );
              })}
            </div>

            {/* Logout Button if Authenticated */}
            {isAuthenticated && (
              <div className="pt-4 border-t border-[#21262D]">
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-rose-950/30 text-rose-300 hover:bg-rose-950/60 border border-rose-900/40 text-xs font-medium transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MobileBottomBar;
