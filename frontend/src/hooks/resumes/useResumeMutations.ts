import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useDebouncedMutation } from '@/hooks/utils/useDebouncedMutation';
import { exportResumePdf, generateResumeContent, updateResume } from '@/services/resume';
import type { ResumeData } from '@/types/resume';

export function useResumeMutations() {
  const queryClient = useQueryClient();

  const { mutate: generateContent, isPending: isGenerating } = useMutation({
    mutationFn: (resumeId: string) => generateResumeContent(resumeId),
    onSuccess: (data, resumeId) => {
      // Update cache with generated content
      queryClient.setQueryData(['resume', resumeId], data);
      // Invalidate HTML cache to get fresh render
      queryClient.invalidateQueries({ queryKey: ['resume', resumeId, 'html'] });
    },
  });

  const { mutate: saveResume, isPending: isSaving } = useDebouncedMutation({
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
    delay: 1000,
  });

  const { mutateAsync: exportPdf, isPending: isExporting } = useMutation({
    mutationFn: ({ resumeId, data }: { resumeId: string; data: ResumeData }) => {
      return exportResumePdf(resumeId, data);
    },
  });

  return {
    generateContent,
    isGenerating,
    saveResume,
    isSaving,
    exportPdf,
    isExporting,
  };
}
