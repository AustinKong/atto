import { queryOptions } from '@tanstack/react-query';

import { getResume, getResumeHtml } from '@/services/resume';
import type { Section } from '@/types/resume';

export const resumeQueries = {
  item: (resumeId: string) =>
    queryOptions({
      queryKey: ['resume', resumeId] as const,
      queryFn: () => getResume(resumeId),
      enabled: !!resumeId,
      staleTime: Infinity,
      retry: false,
    }),

  html: (template: string, sections: Section[]) =>
    queryOptions({
      queryKey: ['resume', 'html', template] as const,
      queryFn: () => getResumeHtml(template, sections),
      enabled: !!template && !!sections,
      staleTime: 0, // Always fetch fresh HTML
      placeholderData: (previous) => previous,
    }),
};
