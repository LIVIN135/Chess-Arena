import React, { Suspense, lazy, useEffect, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute, AdminRoute } from './components/auth/ProtectedRoute';
import { fetchSystemHealth } from './services/healthService';
import { useAuthStore } from './store/useAuthStore';

// Safe dynamic lazy import helper for both named and default exports
const lazyNamed = (importFn, name) =>
  lazy(() => importFn().then((m) => ({ default: m[name] || m.default })));

// Lazy-loaded routes for code splitting
const LandingPage = lazyNamed(() => import('./pages/LandingPage'), 'LandingPage');
const PlayOnlinePage = lazyNamed(() => import('./pages/PlayOnlinePage'), 'PlayOnlinePage');
const PlayAiPage = lazyNamed(() => import('./pages/PlayAiPage'), 'PlayAiPage');
const PlayLocalPage = lazyNamed(() => import('./pages/PlayLocalPage'), 'PlayLocalPage');
const PuzzlePage = lazyNamed(() => import('./pages/PuzzlePage'), 'PuzzlePage');
const TournamentsPage = lazyNamed(() => import('./pages/TournamentsPage'), 'TournamentsPage');
const GameAnalysisPage = lazyNamed(() => import('./pages/GameAnalysisPage'), 'GameAnalysisPage');
const GameHistoryPage = lazyNamed(() => import('./pages/GameHistoryPage'), 'GameHistoryPage');
const SocialPage = lazyNamed(() => import('./pages/SocialPage'), 'SocialPage');
const MonitoringPage = lazyNamed(() => import('./pages/MonitoringPage'), 'MonitoringPage');
const LoginPage = lazyNamed(() => import('./pages/auth/LoginPage'), 'LoginPage');
const RegisterPage = lazyNamed(() => import('./pages/auth/RegisterPage'), 'RegisterPage');

const PageLoadingFallback = () => (
  <div className="space-y-6 animate-pulse max-w-7xl mx-auto p-4">
    <div className="h-8 w-64 bg-[#1F242C] rounded-xl" />
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 h-[480px] bg-[#161B22] border border-[#21262D] rounded-2xl" />
      <div className="lg:col-span-5 h-[480px] bg-[#161B22] border border-[#21262D] rounded-2xl" />
    </div>
  </div>
);

export function App() {
  const [healthData, setHealthData] = useState(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(true);

  const { initialize } = useAuthStore();

  const checkHealth = useCallback(async () => {
    setIsLoadingHealth(true);
    try {
      const data = await fetchSystemHealth();
      setHealthData(data);
    } catch {
      setHealthData(null);
    } finally {
      setIsLoadingHealth(false);
    }
  }, []);

  useEffect(() => {
    initialize();
    checkHealth();
  }, [initialize, checkHealth]);

  const isBackendHealthy = healthData !== null && healthData.status === 'UP';

  return (
    <BrowserRouter>
      <AppLayout
        backendHealthy={isLoadingHealth && !healthData ? null : isBackendHealthy}
        onRefreshHealth={checkHealth}
        isCheckingHealth={isLoadingHealth}
      >
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/play" element={<PlayOnlinePage />} />
            <Route path="/ai" element={<PlayAiPage />} />
            <Route path="/local" element={<PlayLocalPage />} />
            <Route path="/puzzles" element={<PuzzlePage />} />
            <Route path="/tournaments" element={<TournamentsPage />} />
            <Route path="/analysis" element={<GameAnalysisPage />} />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <GameHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route path="/social" element={<SocialPage />} />
            <Route
              path="/monitoring"
              element={
                <AdminRoute>
                  <MonitoringPage />
                </AdminRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
