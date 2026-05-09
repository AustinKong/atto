import { queryOptions } from '@tanstack/react-query';

import { getApplication, getApplicationAnalysisStatus } from '@/services/application.service';

export const applicationQueries = {
  item: (id: string) =>
    queryOptions({
      queryKey: ['application', id] as const,
      queryFn: () => getApplication(id),
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),
  analysisStatus: (id: string) =>
    queryOptions({
      queryKey: ['application', id, 'analysis-status'] as const,
      queryFn: () => getApplicationAnalysisStatus(id),
    }),
};
