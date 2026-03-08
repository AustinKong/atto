import type { QueryClient } from '@tanstack/react-query';

import { ErrorElement } from '@/components/ui/ErrorBoundary';
import { settingsLoader } from '@/loaders/setting.loaders';

import { SettingsPage } from './index';

export function settingsRoute(queryClient: QueryClient) {
  return {
    path: 'settings',
    element: <SettingsPage />,
    loader: settingsLoader(queryClient),
    handle: { breadcrumb: 'Settings' },
    errorElement: <ErrorElement />,
  };
}
