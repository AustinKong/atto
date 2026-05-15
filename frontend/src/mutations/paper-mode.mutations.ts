import { useMutation, useQueryClient } from '@tanstack/react-query';

import { enterPaperMode } from '@/services/paper-mode.service';

export function useEnterPaperMode(onSuccess?: () => Promise<void> | void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enterPaperMode,
    onSuccess: async () => {
      queryClient.clear();
      await onSuccess?.();
    },
  });
}
