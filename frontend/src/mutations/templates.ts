import { useMutation } from '@tanstack/react-query';

import { renderTemplatePdf } from '@/services/templates';
import type { Profile } from '@/types/profile';
import type { Section } from '@/types/resume';
import type { Template } from '@/types/template';

export function useRenderTemplatePdf() {
  return useMutation<Blob, Error, { template: Template; sections: Section[]; profile: Profile }>({
    mutationFn: async ({ template, sections, profile }) => {
      return renderTemplatePdf(template, sections, profile);
    },
  });
}
