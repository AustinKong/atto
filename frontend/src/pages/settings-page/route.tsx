import type { QueryClient } from '@tanstack/react-query';

import { ErrorElement } from '@/components/ui/ErrorBoundary';
import { settingsQueries } from '@/queries/settings';

import { SettingsPage } from './index';

function settingsLoader(queryClient: QueryClient) {
  return async () => {
    return queryClient.ensureQueryData(settingsQueries.all());
  };
}

export function settingsRoute(queryClient: QueryClient) {
  return {
    path: 'settings',
    element: <SettingsPage />,
    loader: settingsLoader(queryClient),
    errorElement: <ErrorElement />,
  };
}
