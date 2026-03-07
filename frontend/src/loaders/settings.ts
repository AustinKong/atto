import type { QueryClient } from '@tanstack/react-query';

import { settingsQueries } from '@/queries/settings';

export function settingsLoader(queryClient: QueryClient) {
  return async () => {
    return queryClient.ensureQueryData(settingsQueries.all());
  };
}
