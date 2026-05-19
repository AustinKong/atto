import { useMutation, useQueryClient } from '@tanstack/react-query';

import { settingsQueries } from '@/queries/setting.queries';
import { updateSettings } from '@/services/setting.service';

export function useUpdateSettings({
  onSuccess,
  onError,
}: {
  onSuccess?: () => Promise<void> | void;
  onError?: (error: unknown) => Promise<void> | void;
} = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSettings,
    onSuccess: async (updatedSettings) => {
      queryClient.setQueryData(settingsQueries.keys.list(), updatedSettings);
      await onSuccess?.();
    },
    onError: async (error) => {
      await onError?.(error);
    },
  });
}
