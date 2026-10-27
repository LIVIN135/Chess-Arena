import api from './api';

export const fetchSystemHealth = async () => {
  const response = await api.get('/health');
  return response.data.data;
};
