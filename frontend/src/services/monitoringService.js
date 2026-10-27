import api from './api';

export const monitoringService = {
  getMetrics: async (signal) => {
    const res = await api.get('/monitoring/metrics', { signal });
    return res.data;
  },

  clearCache: async (cacheName = 'all') => {
    const res = await api.post(`/monitoring/cache/clear?cacheName=${encodeURIComponent(cacheName)}`);
    return res.data;
  },

  getPrometheusRaw: async () => {
    try {
      const token = localStorage.getItem('chess_arena_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch('/actuator/prometheus', { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      return `Prometheus endpoint unreachable: ${err.message}`;
    }
  },
};

export default monitoringService;
