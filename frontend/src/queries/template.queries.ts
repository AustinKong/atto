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

const templateQueryKeys = {
  root: () => ['template'] as const,

  mergedListRoot: () => [...templateQueryKeys.root(), 'merged', 'list'] as const,
  mergedList: (page: number = 1, size: number = 10) =>
    [...templateQueryKeys.mergedListRoot(), page, size] as const,

  localListRoot: () => [...templateQueryKeys.root(), 'list', 'local'] as const,
  localList: (page: number = 1, size: number = 10) =>
    [...templateQueryKeys.localListRoot(), page, size] as const,

  item: (templateId: string) => [...templateQueryKeys.root(), 'item', templateId] as const,
  localItem: (templateId: string) => [...templateQueryKeys.root(), 'local', templateId] as const,

  renderRoot: () => [...templateQueryKeys.root(), 'render'] as const,
  render: (template: Template, sections: Section[], profile: Profile, readonly: boolean = false) =>
    [
      ...templateQueryKeys.renderRoot(),
      readonly ? 'readonly' : 'editable',
      template.content,
      JSON.stringify(sections),
      JSON.stringify(profile),
    ] as const,
};

export const templateQueries = {
  keys: templateQueryKeys,
  list: (page: number = 1, size: number = 10) =>
    queryOptions({
      queryKey: templateQueryKeys.mergedList(page, size),
      queryFn: () => getTemplates(page, size),
      staleTime: 1000 * 60 * 5,
    }),
  localList: (page: number = 1, size: number = 10) =>
    queryOptions({
      queryKey: templateQueryKeys.localList(page, size),
      queryFn: () => getLocalTemplates(page, size),
    }),
  item: (templateId: string) =>
    queryOptions({
      queryKey: templateQueryKeys.item(templateId),
      queryFn: () => getTemplate(templateId),
      enabled: !!templateId,
      staleTime: Infinity,
    }),
  localItem: (templateId: string) =>
    queryOptions({
      queryKey: templateQueryKeys.localItem(templateId),
      queryFn: () => getLocalTemplate(templateId),
      enabled: !!templateId,
      staleTime: Infinity,
    }),
  render: (template: Template, sections: Section[], profile: Profile, readonly: boolean = false) =>
    queryOptions({
      queryKey: templateQueryKeys.render(template, sections, profile, readonly),
      queryFn: async () => {
        return renderTemplate(template, sections, profile);
      },
      enabled: !!template && !!sections && !!profile,
      staleTime: readonly ? 1000 * 60 * 60 * 24 : 0, // 24 hours for readonly, immediate for editable
      gcTime: readonly ? 1000 * 60 * 5 : 1000 * 60, // 5 minutes for readonly, 1 minute for editable
      placeholderData: keepPreviousData,
    }),
};
