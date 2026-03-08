import { keepPreviousData, queryOptions } from '@tanstack/react-query';

import {
  getLocalTemplate,
  getLocalTemplates,
  getTemplate,
  getTemplates,
  renderTemplate,
} from '@/services/template.service';
import type { Profile, Section } from '@/types/resume.types';
import type { Template } from '@/types/template.types';

export const templateQueries = {
  list: (page: number = 1, size: number = 10) =>
    queryOptions({
      queryKey: ['template', 'merged', 'list', page, size] as const,
      queryFn: () => getTemplates(page, size),
      staleTime: 1000 * 60 * 5,
    }),
  localList: (page: number = 1, size: number = 10) =>
    queryOptions({
      queryKey: ['template', 'list', 'local', page, size] as const,
      queryFn: () => getLocalTemplates(page, size),
    }),
  item: (templateId: string) =>
    queryOptions({
      queryKey: ['template', 'item', templateId] as const,
      queryFn: () => getTemplate(templateId),
      enabled: !!templateId,
      staleTime: Infinity,
    }),
  localItem: (templateId: string) =>
    queryOptions({
      queryKey: ['template', 'local', templateId] as const,
      queryFn: () => getLocalTemplate(templateId),
      enabled: !!templateId,
      staleTime: Infinity,
    }),
  render: (template: Template, sections: Section[], profile: Profile, readonly: boolean = false) =>
    queryOptions({
      queryKey: [
        'template',
        'render',
        readonly ? 'readonly' : 'editable',
        template.content,
        JSON.stringify(sections),
        JSON.stringify(profile),
      ] as const,
      queryFn: async () => {
        return renderTemplate(template, sections, profile);
      },
      enabled: !!template && !!sections && !!profile,
      staleTime: readonly ? 1000 * 60 * 60 * 24 : 0, // 24 hours for readonly, immediate for editable
      gcTime: readonly ? 1000 * 60 * 5 : 1000 * 60, // 5 minutes for readonly, 1 minute for editable
      placeholderData: keepPreviousData,
    }),
};
