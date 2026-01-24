import { queryOptions } from '@tanstack/react-query';

import type { DebouncedQueryOptions } from '@/hooks/useDebouncedQuery';
import { getResume, getResumeHtml } from '@/services/resume';
import type { ResumeData } from '@/types/resume';

export const resumeQueries = {
  item: (resumeId: string) =>
    queryOptions({
      queryKey: ['resume', resumeId] as const,
      queryFn: () => getResume(resumeId),
      enabled: !!resumeId,
      staleTime: Infinity,
      retry: false,
    }),

  html: (resumeId: string, template: string, data: ResumeData) =>
    queryOptions({
      queryKey: ['resume', resumeId, 'html', template] as const,
      queryFn: () => getResumeHtml(template, data),
      enabled: !!resumeId && !!template && !!data,
      staleTime: 0, // Always fetch fresh HTML
    }),

  // Factory for debounced HTML queries - returns complete config for useDebouncedQuery
  debouncedHtml: (
    resumeId: string,
    template: string,
    dataKey: string
  ): DebouncedQueryOptions<string> => ({
    queryKey: ['resume', resumeId, 'html', template] as const,
    queryFn: (debouncedDataKey: string) => {
      // debouncedDataKey is the debounced JSON stringified data
      const data = JSON.parse(debouncedDataKey) as ResumeData;
      return getResumeHtml(template, data);
    },
    inputValue: dataKey,
    delay: 1000,
    staleTime: 0, // Always fetch fresh HTML
    gcTime: 1 * 60 * 1000, // Should be garbage collected fast since dataKey changes often
    placeholderData: (previousData) => previousData,
  }),
};
