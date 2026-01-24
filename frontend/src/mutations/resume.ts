import { useMutation, useQueryClient } from '@tanstack/react-query';

import { exportResumePdf, generateResumeContent, updateResume } from '@/services/resume';
import type { ResumeData } from '@/types/resume';

export function useGenerateResumeContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (resumeId: string) => generateResumeContent(resumeId),
    onSuccess: (data, resumeId) => {
      // Update cache with generated content
      queryClient.setQueryData(['resume', resumeId], data);
      // Invalidate HTML cache to get fresh render
      queryClient.invalidateQueries({ queryKey: ['resume', resumeId, 'html'] });
    },
  });
}

export function useSaveResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ resumeId, data }: { resumeId: string; data: ResumeData }) => {
      return updateResume(resumeId, data);
    },
    onSuccess: (data, { resumeId }) => {
      // Update cache with saved data
      queryClient.setQueryData(['resume', resumeId], data);
    },
    onError: (error) => {
      console.error('Failed to save resume:', error);
    },
  });
}

export function useExportResumePdf() {
  return useMutation({
    mutationFn: ({ resumeId, data }: { resumeId: string; data: ResumeData }) => {
      return exportResumePdf(resumeId, data);
    },
  });
}
