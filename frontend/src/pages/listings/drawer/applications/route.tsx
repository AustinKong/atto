import type { QueryClient } from '@tanstack/react-query';
import { Outlet } from 'react-router';

import { applicationLoader } from '@/loaders/application.loaders';
import { baseRoute } from '@/routes';
import type { Application } from '@/types/application.types';

import { Applications } from './index';

export function applicationsRoute(queryClient: QueryClient) {
  return baseRoute({
    path: 'applications',
    element: Outlet,
    handle: { breadcrumb: 'Applications' },
    children: [
      baseRoute({
        index: true,
        element: <Applications />,
      }),
      baseRoute({
        path: ':applicationId',
        element: <Applications />,
        loader: applicationLoader(queryClient),
        handle: {
          breadcrumb: (data: { application: Application }) => data.application.name,
        },
      }),
    ],
  });
}
