import { useQueryClient } from '@tanstack/react-query';

import { useDebouncedMutation } from '@/hooks/use-debounced-mutation.hooks';
import { updateResume } from '@/services/resume.service';
import type { Resume, Section } from '@/types/resume.types';

// TODO: Should merge into one?
export function useSaveResumeSections() {
  const queryClient = useQueryClient();

  return useDebouncedMutation<Resume, Error, { resumeId: string; sections: Section[] }>({
    delay: 500,
    mutationFn: ({ resumeId, sections }) => {
      const currentResume = queryClient.getQueryData<Resume>(['resume', resumeId]);
      if (!currentResume) {
        throw new Error('Resume not found in cache');
      }
      return updateResume({ ...currentResume, sections });
    },
    onSuccess: (data, { resumeId }) => {
      queryClient.setQueryData(['resume', resumeId], data);
    },
    onError: (error) => {
      console.error('Failed to save resume:', error);
    },
  });
}
