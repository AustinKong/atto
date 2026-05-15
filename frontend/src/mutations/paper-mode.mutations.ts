import { useMutation, useQueryClient } from '@tanstack/react-query';

import { settingsQueries } from '@/queries/setting.queries';
import { enterPaperMode, exitPaperMode } from '@/services/paper-mode.service';

export function useEnterPaperMode(onSuccess?: () => Promise<void> | void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enterPaperMode,
    onSuccess: async () => {
      queryClient.clear();
      await queryClient.invalidateQueries({ queryKey: settingsQueries.list().queryKey });
      await onSuccess?.();
    },
  });
}

export function useExitPaperMode(onSuccess?: () => Promise<void> | void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: exitPaperMode,
    onSuccess: async () => {
      queryClient.clear();
      await queryClient.invalidateQueries({ queryKey: settingsQueries.list().queryKey });
      await onSuccess?.();
    },
  });
}
