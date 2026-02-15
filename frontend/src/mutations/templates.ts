import { useMutation } from '@tanstack/react-query';

import { renderTemplatePdf } from '@/services/templates';
import type { Profile } from '@/types/profile';
import type { Section } from '@/types/resume';

export function useRenderTemplatePdf() {
  return useMutation<Blob, Error, { template: string; sections: Section[]; profile: Profile }>({
    mutationFn: async ({ template, sections, profile }) => {
      return renderTemplatePdf(template, sections, profile);
    },
  });
}
