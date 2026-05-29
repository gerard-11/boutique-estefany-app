import api from './api';

export const getDashboardSummary = async () => {
  const response = await api.get('/dashboard-report/summary');
  return response.data;
};
