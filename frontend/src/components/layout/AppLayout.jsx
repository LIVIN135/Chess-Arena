import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MobileBottomBar } from './MobileBottomBar';
import { ToastContainer } from '../ui/Toast';
import { NavLink } from 'react-router-dom';

export const AppLayout = ({
  children,
  backendHealthy,
  onRefreshHealth,
  isCheckingHealth,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#0E1116] text-[#F0F6FC]">
      {/* Desktop Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        backendHealthy={backendHealthy}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {/* Mobile Top Header */}
        <header className="md:hidden flex h-14 items-center justify-between px-4 bg-[#161B22] border-b border-[#21262D] sticky top-0 z-30">
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7FB069] text-[#0E1116] font-bold text-base shadow-sm">
              ♞
            </div>
            <span className="font-bold text-sm text-[#F0F6FC]">Chess Arena</span>
          </NavLink>

          <div className="flex items-center gap-2">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                backendHealthy === true
                  ? 'bg-[#7FB069]'
                  : backendHealthy === false
                  ? 'bg-rose-500'
                  : 'bg-amber-400 animate-pulse'
              }`}
              title={backendHealthy ? 'Online' : 'Offline'}
            />
          </div>
        </header>

        {/* Viewport Content Container */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile 5-Tab Bottom Bar */}
      <MobileBottomBar backendHealthy={backendHealthy} />

      {/* Global Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default AppLayout;
