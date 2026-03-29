import type { QueryClient } from '@tanstack/react-query';

import { settingsLoader } from '@/loaders/setting.loaders';
import { baseRoute } from '@/routes';

import { SettingsPage } from './index';

export function settingsRoute(queryClient: QueryClient) {
  return baseRoute({
    path: 'settings',
    element: <SettingsPage />,
    loader: settingsLoader(queryClient),
    handle: { breadcrumb: 'Settings' },
  });
}
