import { useQueryClient } from '@tanstack/react-query';

import { useDebouncedMutation } from '@/hooks/useDebouncedMutation';
import { updateResume } from '@/services/resume';
import type { Profile, Resume, Section } from '@/types/resume';

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

export function useSaveResumeProfile() {
  const queryClient = useQueryClient();

  return useDebouncedMutation<Resume, Error, { resumeId: string; profile: Profile }>({
    delay: 500,
    mutationFn: ({ resumeId, profile }) => {
      const currentResume = queryClient.getQueryData<Resume>(['resume', resumeId]);
      if (!currentResume) {
        throw new Error('Resume not found in cache');
      }
      return updateResume({ ...currentResume, profile });
    },
    onSuccess: (data, { resumeId }) => {
      queryClient.setQueryData(['resume', resumeId], data);
    },
    onError: (error) => {
      console.error('Failed to save resume profile:', error);
    },
  });
}
