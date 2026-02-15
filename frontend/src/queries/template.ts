import { keepPreviousData, queryOptions } from '@tanstack/react-query';

import { getLocalTemplateNames, getTemplate, renderTemplateHtml } from '@/services/templates';
import type { Profile } from '@/types/profile';
import type { Section } from '@/types/resume';

export const templateQueries = {
  list: () =>
    queryOptions({
      queryKey: ['templates', 'list'],
      queryFn: () => getLocalTemplateNames(),
    }),
  item: (templateId: string) =>
    queryOptions({
      queryKey: ['template', templateId] as const,
      queryFn: () => getTemplate(templateId, 'local'),
      enabled: !!templateId,
      staleTime: Infinity,
    }),
  renderHtml: (template: string, sections: Section[], profile: Profile) =>
    queryOptions({
      queryKey: [
        'templates',
        'render',
        'html',
        template,
        JSON.stringify(sections),
        JSON.stringify(profile),
      ] as const,
      queryFn: async () => {
        return renderTemplateHtml(template, sections, profile);
      },
      enabled: !!template && !!sections && !!profile,
      staleTime: 0,
      placeholderData: keepPreviousData,
    }),
};
