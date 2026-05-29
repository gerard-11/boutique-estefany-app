import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '../services/dashboardService';

export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: getDashboardSummary,
    // Refrescar cada 5 minutos o cuando la ventana gane foco
    refetchInterval: 1000 * 60 * 5, 
  });
};
