import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useDebouncedMutation } from '@/hooks/useDebouncedMutation';
import { exportResumePdf, generateResumeContent, updateResume } from '@/services/resume';
import type { Resume, ResumeData } from '@/types/resume';

export function useGenerateResumeContent() {
  const queryClient = useQueryClient();

  return useMutation<Resume, Error, string>({
    mutationFn: (resumeId: string) => generateResumeContent(resumeId),
    onSuccess: (data: Resume, resumeId: string) => {
      // Update cache with generated content
      queryClient.setQueryData(['resume', resumeId], data);
      // Invalidate HTML cache to get fresh render
      queryClient.invalidateQueries({ queryKey: ['resume', resumeId, 'html'] });
    },
  });
}

export function useSaveResume() {
  const queryClient = useQueryClient();

  return useDebouncedMutation<Resume, Error, { resumeId: string; data: ResumeData }>({
    delay: 750,
    mutationFn: async ({ resumeId, data }: { resumeId: string; data: ResumeData }) => {
      return updateResume(resumeId, data);
    },
    onSuccess: (data, { resumeId }) => {
      // Update cache with saved data
      // FIXME: Do i even need this still? Because the form is the definitive source of truth anyways
      queryClient.setQueryData(['resume', resumeId], data);
    },
    onError: (error) => {
      console.error('Failed to save resume:', error);
    },
  });
}

export function useExportResumePdf() {
  return useMutation<Blob, Error, { resumeId: string; data: ResumeData }>({
    mutationFn: ({ resumeId, data }: { resumeId: string; data: ResumeData }) => {
      return exportResumePdf(resumeId, data);
    },
  });
}
