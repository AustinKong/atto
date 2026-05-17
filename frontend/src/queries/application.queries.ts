import { queryOptions } from '@tanstack/react-query';

import { getApplication, getApplicationAnalysisStatus } from '@/services/application.service';

const applicationQueryKeys = {
  root: () => ['application'] as const,
  item: (id: string) => [...applicationQueryKeys.root(), 'item', id] as const,
  analysisStatus: (id: string) => [...applicationQueryKeys.item(id), 'analysis-status'] as const,
};

export const applicationQueries = {
  keys: applicationQueryKeys,
  item: (id: string) =>
    queryOptions({
      queryKey: applicationQueryKeys.item(id),
      queryFn: () => getApplication(id),
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),
  analysisStatus: (id: string) =>
    queryOptions({
      queryKey: applicationQueryKeys.analysisStatus(id),
      queryFn: () => getApplicationAnalysisStatus(id),
    }),
};
