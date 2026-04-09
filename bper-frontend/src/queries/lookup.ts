import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export const useDepartments = () => useQuery({
  queryKey: ['departments'],
  queryFn: () => api.get('/api/eper/activities/departments').then(res => res.data)
});

export const useActivities = (departmentId?: string) => useQuery({
  queryKey: ['activities', departmentId],
  queryFn: () => api.get(`/api/eper/activities?department=${departmentId}`).then(res => res.data),
  enabled: !!departmentId
});

export const useProcesses = (activityId?: string) => useQuery({
  queryKey: ['processes', activityId],
  queryFn: () => api.get(`/api/eper/activities/processes?activity=${activityId}`).then(res => res.data),
  enabled: !!activityId
});

