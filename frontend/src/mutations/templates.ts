import { useMutation } from '@tanstack/react-query';

import { renderTemplate } from '@/services/templates';
import type { Profile, Section } from '@/types/resume';
import type { Template } from '@/types/template';

export function useRenderTemplate() {
  return useMutation<Blob, Error, { template: Template; sections: Section[]; profile: Profile }>({
    mutationFn: async ({ template, sections, profile }) => {
      return renderTemplate(template, sections, profile);
    },
  });
}
