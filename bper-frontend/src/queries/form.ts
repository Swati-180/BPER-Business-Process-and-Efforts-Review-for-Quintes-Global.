import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useMySubmissions = () => {
  return useQuery({
    queryKey: ['mySubmissions'],
    queryFn: async () => {
      const { data } = await api.get('/api/eper/wdt/my');
      return data; // array of submissions
    }
  });
};

export const useTeamSubmissions = () => {
  return useQuery({
    queryKey: ['teamSubmissions'],
    queryFn: async () => {
      const { data } = await api.get('/api/eper/wdt/team');
      return data;
    }
  });
};

export const useApproveSubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.put(`/api/eper/wdt/approve/${id}`);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teamSubmissions'] })
  });
};

export const useReturnSubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, revisionNote }: { id: string, revisionNote?: string }) => {
      const { data } = await api.put(`/api/eper/wdt/return/${id}`, { revisionNote });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teamSubmissions'] })
  });
};

export const useFlagActivities = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, flags }: { id: string, flags: any[] }) => {
      const { data } = await api.put(`/api/eper/wdt/flag/${id}`, { flags });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teamSubmissions'] })
  });
};

export const useGrantEdit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, activityIndex, granted }: { id: string, activityIndex: number, granted: boolean }) => {
      const { data } = await api.put(`/api/eper/wdt/grant-edit/${id}`, { activityIndex, granted });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teamSubmissions'] })
  });
};
