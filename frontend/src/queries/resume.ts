import { keepPreviousData, queryOptions } from '@tanstack/react-query';

import { getResume, getResumeHtml } from '@/services/resume';
import type { Profile } from '@/types/profile';
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

  html: (template: string, sections: Section[], profile: Profile) =>
    queryOptions({
      queryKey: [
        'resume',
        'html',
        template,
        JSON.stringify(sections),
        JSON.stringify(profile),
      ] as const,
      queryFn: () => getResumeHtml(template, sections, profile),
      enabled: !!template && !!sections && !!profile,
      staleTime: 0, // Always fetch fresh HTML
      placeholderData: keepPreviousData,
    }),
};
