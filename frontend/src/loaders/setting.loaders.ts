import type { QueryClient } from '@tanstack/react-query';

import { settingsQueries } from '@/queries/setting.queries';

export function settingsLoader(queryClient: QueryClient) {
  return async () => {
    return queryClient.ensureQueryData(settingsQueries.list());
  };
}
