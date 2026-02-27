import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useDebouncedMutation } from '@/hooks/useDebouncedMutation';
import { generateResumeContent, populateResumeBaseSections, updateResume } from '@/services/resume';
import type { Resume, Section } from '@/types/resume';

export function useGenerateResumeContent(options?: { onSuccess?: (sections: Section[]) => void }) {
  const queryClient = useQueryClient();

  return useMutation<Resume, Error, string>({
    mutationFn: (resumeId: string) => generateResumeContent(resumeId),
    onSuccess: (data: Resume, resumeId: string) => {
      queryClient.setQueryData(['resume', resumeId], data);
      options?.onSuccess?.(data.sections);
    },
  });
}

export function usePopulateResumeBaseSections(options?: {
  onSuccess?: (sections: Section[]) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation<Resume, Error, string>({
    mutationFn: (resumeId: string) => populateResumeBaseSections(resumeId),
    onSuccess: (data: Resume, resumeId: string) => {
      queryClient.setQueryData(['resume', resumeId], data);
      options?.onSuccess?.(data.sections);
    },
  });
}

export function useSaveResume() {
  const queryClient = useQueryClient();

  return useDebouncedMutation<Resume, Error, { resumeId: string; sections: Section[] }>({
    delay: 750,
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

export function useUpdateResumeTemplate() {
  const queryClient = useQueryClient();

  return useMutation<Resume, Error, { resumeId: string; templateId: string }>({
    mutationFn: ({ resumeId, templateId }) => {
      const currentResume = queryClient.getQueryData<Resume>(['resume', resumeId]);
      if (!currentResume) {
        throw new Error('Resume not found in cache');
      }
      return updateResume({ ...currentResume, templateId });
    },
    onSuccess: (data, { resumeId }) => {
      queryClient.setQueryData(['resume', resumeId], data);
    },
  });
}
