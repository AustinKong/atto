import { useDebouncedQuery } from '@/hooks/utils/useDebouncedQuery';
import { getResumeHtml } from '@/services/resume';
import type { ResumeData } from '@/types/resume';

/**
 * Hook to fetch and render HTML with debouncing.
 * Debounces the query by 500ms to avoid excessive re-renders while editing.
 */
export function useResumeHtml(resumeId: string, template: string, data: ResumeData) {
  // Stringify data directly - useDebouncedQuery will handle the debouncing
  const dataKey = JSON.stringify(data);

  const { data: html = '', isLoading } = useDebouncedQuery({
    queryKey: ['resume', resumeId, 'html', template],
    inputValue: dataKey,
    queryFn: async () => {
      return getResumeHtml(template, data);
    },
    placeholderData: (previousData) => previousData,
    delay: 1000,
    staleTime: Infinity,
    gcTime: 1 * 6 * 1000, // Should be garbage collected fast since dataKey changes often
  });

  return {
    html,
    isLoading,
  };
}
