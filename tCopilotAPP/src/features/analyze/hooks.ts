import { useMutation, useQuery } from '@tanstack/react-query';
import { analyzeLite, analyzePro, getLogs } from './api';

export const useLiteAnalyze = () => useMutation({ mutationFn: analyzeLite });
export const useProAnalyze  = () => useMutation({ mutationFn: analyzePro  });

export const useLogs = (token: string, mode: 'LITE' | 'PRO') =>
  useQuery({ queryKey: ['logs', token, mode], queryFn: () => getLogs({ token, mode }) });
