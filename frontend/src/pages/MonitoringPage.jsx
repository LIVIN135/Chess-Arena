import React, { useState, useEffect, useCallback } from 'react';
import monitoringService from '../services/monitoringService';

export const MonitoringPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [clearingCache, setClearingCache] = useState(false);
  const [cacheStatus, setCacheStatus] = useState(null);
  const [showPrometheus, setShowPrometheus] = useState(false);
  const [prometheusData, setPrometheusData] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const fetchMetrics = useCallback(async (signal) => {
    try {
      const data = await monitoringService.getMetrics(signal);
      setMetrics(data);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        console.error('Failed to fetch telemetry metrics:', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let controller = new AbortController();
    fetchMetrics(controller.signal);

    if (!autoRefresh) {
      return () => controller.abort();
    }

    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        controller = new AbortController();
        fetchMetrics(controller.signal);
      }
    }, 15000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        controller = new AbortController();
        fetchMetrics(controller.signal);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      controller.abort();
    };
  }, [autoRefresh, fetchMetrics]);

  const handleClearCache = async (cacheName = 'all') => {
    try {
      setClearingCache(true);
      const res = await monitoringService.clearCache(cacheName);
      setCacheStatus({ type: 'success', message: res.message || 'Cache cleared!' });
      await fetchMetrics();
      setTimeout(() => setCacheStatus(null), 3500);
    } catch (err) {
      setCacheStatus({ type: 'error', message: err.message || 'Failed to clear cache' });
      setTimeout(() => setCacheStatus(null), 3500);
    } finally {
      setClearingCache(false);
    }
  };

  const loadPrometheus = async () => {
    setShowPrometheus(!showPrometheus);
    if (!showPrometheus) {
      const raw = await monitoringService.getPrometheusRaw();
      setPrometheusData(raw);
    }
  };

  const formatUptime = (seconds) => {
    if (!seconds && seconds !== 0) return '0s';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  if (loading && !metrics) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent mb-4" />
        <p className="text-gray-400 text-sm">Streaming system metrics &amp; telemetry...</p>
      </div>
    );
  }

  const heapPct = metrics?.heapUsagePercent || 0;
  const dbLatency = metrics?.dbQueryLatencyMs ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#262c3b] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span className="text-emerald-400">⚡</span> Performance &amp; Monitoring
            </h1>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
              Admin Console
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-400">
            Real-time JVM metrics, HikariCP database pool telemetry, cache management, and Prometheus instrumentation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-[#151921] border border-[#262c3b] px-3 py-1.5 text-xs text-gray-300">
            <span className={`inline-block h-2 w-2 rounded-full ${autoRefresh ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
            <span>{autoRefresh ? 'Live (15s)' : 'Paused'}</span>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="ml-2 font-medium text-emerald-400 hover:text-emerald-300 underline"
            >
              {autoRefresh ? 'Pause' : 'Resume'}
            </button>
          </div>

          <button
            onClick={() => fetchMetrics()}
            className="rounded-lg bg-[#1c212c] px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-[#262c3b] border border-[#262c3b] transition-colors"
          >
            🔄 Refresh Now
          </button>
        </div>
      </div>

      {/* Cache Notification Toast */}
      {cacheStatus && (
        <div className={`p-4 rounded-xl text-sm font-medium border transition-all ${
          cacheStatus.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {cacheStatus.message}
        </div>
      )}

      {/* Grid of Key Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* System Health Status */}
        <div className="rounded-xl border border-[#262c3b] bg-[#12161f]/80 p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>SYSTEM HEALTH</span>
            <span className="text-[10px] text-gray-500">{lastRefreshed}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">
              {metrics?.status || 'UNKNOWN'}
            </span>
            <span className="text-xs text-emerald-400 font-medium">Uptime: {formatUptime(metrics?.uptimeSeconds)}</span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-[#1c212c]">
            <span>Active Threads</span>
            <span className="font-semibold text-white">{metrics?.activeThreadCount || 0} (Peak {metrics?.peakThreadCount || 0})</span>
          </div>
        </div>

        {/* Database Latency & Pool */}
        <div className="rounded-xl border border-[#262c3b] bg-[#12161f]/80 p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>DB QUERY LATENCY</span>
            <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] text-blue-400 border border-blue-500/20">
              HikariCP
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">
              {dbLatency} ms
            </span>
            <span className={`text-xs font-semibold ${dbLatency < 5 ? 'text-emerald-400' : dbLatency < 20 ? 'text-amber-400' : 'text-red-400'}`}>
              {dbLatency < 5 ? 'Ultra Fast' : 'Normal'}
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-[#1c212c]">
            <span>Pool Connections</span>
            <span className="font-semibold text-white">
              {metrics?.dbActiveConnections ?? 0} active / {metrics?.dbIdleConnections ?? 0} idle / {metrics?.dbMaxConnections ?? 20} max
            </span>
          </div>
        </div>

        {/* JVM Heap Usage */}
        <div className="rounded-xl border border-[#262c3b] bg-[#12161f]/80 p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>JVM HEAP MEMORY</span>
            <span className="text-[10px] text-gray-500">{metrics?.heapUsedMb || 0} MB / {metrics?.heapMaxMb || 0} MB</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">
              {heapPct}%
            </span>
            <span className="text-xs text-gray-400">allocated</span>
          </div>
          <div className="mt-3 w-full bg-[#1c212c] rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                heapPct < 60 ? 'bg-emerald-500' : heapPct < 85 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, heapPct))}%` }}
            />
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs text-gray-400">
            <span>Non-Heap Used</span>
            <span className="font-semibold text-white">{metrics?.nonHeapUsedMb || 0} MB</span>
          </div>
        </div>

        {/* Live Active Games */}
        <div className="rounded-xl border border-[#262c3b] bg-[#12161f]/80 p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>ACTIVE MATCHES</span>
            <span className="rounded bg-purple-500/10 px-1.5 py-0.5 text-[10px] text-purple-400 border border-purple-500/20">
              Live
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">
              {metrics?.activeGames ?? 0}
            </span>
            <span className="text-xs text-gray-400">of {metrics?.totalGames ?? 0} total</span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-[#1c212c]">
            <span>Tournaments / Puzzles</span>
            <span className="font-semibold text-white">
              {metrics?.totalTournaments ?? 0} / {metrics?.totalPuzzles ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* HikariCP Connection Pool Details & CPU Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connection Pool Card */}
        <div className="rounded-2xl border border-[#262c3b] bg-[#12161f] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🗄️</span>
              <h2 className="font-semibold text-white text-base">HikariCP High-Performance Pool</h2>
            </div>
            <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Optimal Tuning
            </span>
          </div>

          <p className="text-xs text-gray-400 mb-6">
            Configured with 20 maximum connections, 5 minimum idle connections, 30s connection timeout, and 10m idle timeout for zero connection starvation during peak tournament play.
          </p>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Pool Utilization</span>
                <span className="text-white font-medium">
                  {metrics?.dbTotalConnections || 0} / {metrics?.dbMaxConnections || 20} Connections
                </span>
              </div>
              <div className="w-full bg-[#1c212c] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (((metrics?.dbTotalConnections || 0) / (metrics?.dbMaxConnections || 20)) * 100))}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#1c212c] text-center">
              <div className="bg-[#151921] p-3 rounded-lg border border-[#262c3b]">
                <p className="text-[11px] text-gray-400">Active</p>
                <p className="text-lg font-bold text-emerald-400 mt-1">{metrics?.dbActiveConnections ?? 0}</p>
              </div>
              <div className="bg-[#151921] p-3 rounded-lg border border-[#262c3b]">
                <p className="text-[11px] text-gray-400">Idle Standby</p>
                <p className="text-lg font-bold text-blue-400 mt-1">{metrics?.dbIdleConnections ?? 0}</p>
              </div>
              <div className="bg-[#151921] p-3 rounded-lg border border-[#262c3b]">
                <p className="text-[11px] text-gray-400">Ping Latency</p>
                <p className="text-lg font-bold text-amber-400 mt-1">{metrics?.dbQueryLatencyMs ?? 0} ms</p>
              </div>
            </div>
          </div>
        </div>

        {/* In-Memory Caching & Eviction Controls */}
        <div className="rounded-2xl border border-[#262c3b] bg-[#12161f] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <h2 className="font-semibold text-white text-base">In-Memory Cache Telemetry</h2>
            </div>
            <button
              onClick={() => handleClearCache('all')}
              disabled={clearingCache}
              className="text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 px-2.5 py-1 rounded border border-red-500/30 transition-colors disabled:opacity-50"
            >
              {clearingCache ? 'Clearing...' : 'Clear All Caches'}
            </button>
          </div>

          <p className="text-xs text-gray-400 mb-6">
            Spring Boot Caching optimizes heavy queries for leaderboards, tournament summaries, and daily puzzle computations.
          </p>

          <div className="space-y-3">
            {metrics?.cacheSizes ? (
              Object.entries(metrics.cacheSizes).map(([name, size]) => (
                <div key={name} className="flex items-center justify-between bg-[#151921] p-3 rounded-xl border border-[#262c3b]">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-xs font-mono text-gray-200">{name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">
                      {size} {size === 1 ? 'entry' : 'entries'}
                    </span>
                    <button
                      onClick={() => handleClearCache(name)}
                      disabled={clearingCache}
                      className="text-[11px] text-gray-400 hover:text-red-400 underline transition-colors"
                    >
                      Evict
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 italic">No cache statistics available</p>
            )}
          </div>
        </div>
      </div>

      {/* Prometheus Telemetry Accordion */}
      <div className="rounded-2xl border border-[#262c3b] bg-[#12161f] p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">📈</span>
            <h2 className="font-semibold text-white text-base">Prometheus Scrape Telemetry (/actuator/prometheus)</h2>
          </div>
          <button
            onClick={loadPrometheus}
            className="rounded-lg bg-[#1c212c] px-3.5 py-1.5 text-xs font-medium text-emerald-400 hover:bg-[#262c3b] border border-[#262c3b] transition-colors"
          >
            {showPrometheus ? 'Hide Metrics Feed' : 'Inspect Raw Prometheus Metrics'}
          </button>
        </div>

        {showPrometheus && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-400 font-mono">Real-time OpenMetrics &amp; Micrometer export format</span>
              <button
                onClick={async () => {
                  const raw = await monitoringService.getPrometheusRaw();
                  setPrometheusData(raw);
                }}
                className="text-xs text-emerald-400 hover:underline"
              >
                Refresh Scrape
              </button>
            </div>
            <pre className="max-h-72 overflow-y-auto rounded-xl bg-[#0b0e14] p-4 text-[11px] font-mono text-gray-300 border border-[#262c3b] scrollbar-thin">
              {prometheusData || 'Fetching scrape stream...'}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonitoringPage;
