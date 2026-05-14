import type { QueryClient } from '@tanstack/react-query';

import { statsLoader } from '@/loaders/stats.loaders';
import { baseRoute } from '@/routes';

import { DashboardPage } from './index';

export function dashboardRoute(queryClient: QueryClient) {
  return baseRoute({
    index: true,
    element: <DashboardPage />,
    loader: statsLoader(queryClient),
  });
}
