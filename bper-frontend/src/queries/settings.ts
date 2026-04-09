import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

interface SubmissionWindow {
  isOpen: boolean;
  deadline: string;
}

export const useSubmissionWindow = () => {
  return useQuery({
    queryKey: ['submissionWindow'],
    queryFn: async () => {
      const { data } = await api.get<SubmissionWindow>('/api/eper/settings/submission-window');
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
};
