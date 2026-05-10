import { useMutation } from '@tanstack/react-query';

import { renderTemplate } from '@/services/template.service';
import type { Profile, Section } from '@/types/resume.types';
import type { RenderedTemplate, Template } from '@/types/template.types';

export function useRenderTemplate() {
  return useMutation<
    RenderedTemplate,
    Error,
    { template: Template; sections: Section[]; profile: Profile }
  >({
    mutationFn: ({ template, sections, profile }) => renderTemplate(template, sections, profile),
  });
}
