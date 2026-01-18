import { useQuery } from '@tanstack/react-query';

import { getResume, getResumeHtml } from '@/services/resume';

export function useResumeQuery(resumeId: string | undefined) {
  const {
    data: resume,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['resume', resumeId],
    queryFn: () => getResume(resumeId!),
    enabled: !!resumeId,
    staleTime: Infinity,
    retry: false,
  });

  return {
    resume,
    isLoading,
    isError,
  };
}

export function useResumeHtmlQuery(resumeId: string | undefined) {
  const { data: resume } = useQuery({
    queryKey: ['resume', resumeId],
    queryFn: () => getResume(resumeId!),
    enabled: !!resumeId,
  });

  const { data: html = '', isLoading } = useQuery({
    queryKey: ['resume', resumeId, 'html'],
    queryFn: () => {
      if (!resume) throw new Error('Resume not loaded');
      return getResumeHtml(resume.template, resume.data);
    },
    enabled: !!resumeId && !!resume,
    staleTime: 0, // Always fetch fresh HTML
  });

  return {
    html,
    isLoading,
  };
}
