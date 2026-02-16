import { keepPreviousData, queryOptions } from '@tanstack/react-query';

import {
  getLocalTemplateNames,
  getRemoteTemplateNames,
  getTemplate,
  renderTemplateHtml,
  renderTemplatePdf,
} from '@/services/templates';
import type { Profile } from '@/types/profile';
import type { Section } from '@/types/resume';

export const templateQueries = {
  list: () =>
    queryOptions({
      queryKey: ['templates', 'list'],
      queryFn: () => getLocalTemplateNames(),
    }),
  remoteList: () =>
    queryOptions({
      queryKey: ['templates', 'remote', 'list'],
      queryFn: () => getRemoteTemplateNames(),
    }),
  item: (templateId: string) =>
    queryOptions({
      queryKey: ['template', templateId] as const,
      queryFn: () => getTemplate(templateId, 'local'),
      enabled: !!templateId,
      staleTime: Infinity,
    }),
  // TODO: Deprecate html rendering
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
  renderPdf: (template: string, sections: Section[], profile: Profile) =>
    queryOptions({
      queryKey: [
        'templates',
        'render',
        'pdf',
        template,
        JSON.stringify(sections),
        JSON.stringify(profile),
      ] as const,
      queryFn: async () => {
        return renderTemplatePdf(template, sections, profile);
      },
      enabled: !!template && !!sections && !!profile,
      staleTime: 0,
      placeholderData: keepPreviousData,
    }),
};
