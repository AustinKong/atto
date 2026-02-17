import { keepPreviousData, queryOptions } from '@tanstack/react-query';

import {
  getLocalTemplate,
  getLocalTemplates,
  getRemoteTemplate,
  getRemoteTemplates,
  renderTemplateHtml,
  renderTemplatePdf,
} from '@/services/templates';
import type { Profile } from '@/types/profile';
import type { Section } from '@/types/resume';
import type { Template } from '@/types/template';

export const templateQueries = {
  list: (page: number = 1, size: number = 10) =>
    queryOptions({
      queryKey: ['templates', 'list', 'local', page, size] as const,
      queryFn: () => getLocalTemplates(page, size),
    }),
  remoteList: (page: number = 1, size: number = 10) =>
    queryOptions({
      queryKey: ['templates', 'remote', 'list', page, size] as const,
      queryFn: () => getRemoteTemplates(page, size),
      staleTime: 1000 * 60 * 60 * 24,
      gcTime: 1000 * 60 * 60 * 24 * 7,
    }),
  localItem: (templateId: string) =>
    queryOptions({
      queryKey: ['templates', 'local', templateId] as const,
      queryFn: () => getLocalTemplate(templateId),
      enabled: !!templateId,
      staleTime: Infinity,
    }),
  remoteItem: (templateId: string) =>
    queryOptions({
      queryKey: ['templates', 'remote', templateId] as const,
      queryFn: () => getRemoteTemplate(templateId),
      enabled: !!templateId,
      staleTime: 1000 * 60 * 60,
    }),
  // TODO: Deprecate html rendering
  renderHtml: (template: Template, sections: Section[], profile: Profile) =>
    queryOptions({
      queryKey: [
        'templates',
        'render',
        'html',
        template.content,
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
  renderPdf: (
    template: Template,
    sections: Section[],
    profile: Profile,
    readonly: boolean = false
  ) =>
    queryOptions({
      queryKey: [
        'templates',
        'render',
        'pdf',
        readonly ? 'readonly' : 'editable',
        template.content,
        JSON.stringify(sections),
        JSON.stringify(profile),
      ] as const,
      queryFn: async () => {
        return renderTemplatePdf(template, sections, profile);
      },
      enabled: !!template && !!sections && !!profile,
      staleTime: readonly ? 1000 * 60 * 60 * 24 : 0, // 24 hours for readonly, immediate for editable
      gcTime: readonly ? 1000 * 60 * 5 : 1000 * 60, // 5 minutes for readonly, 1 minute for editable
      placeholderData: keepPreviousData,
    }),
};
