import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: async () => {
      const { data } = await api.get('/api/eper/reports/dashboard-summary');
      return data;
    }
  });
};
