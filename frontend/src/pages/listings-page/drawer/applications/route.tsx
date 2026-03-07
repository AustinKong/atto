import type { QueryClient } from '@tanstack/react-query';
import { Outlet } from 'react-router';

import { ErrorElement } from '@/components/ui/ErrorBoundary';
import { applicationLoader } from '@/loaders/applications';
import { applicationsListRedirectLoader } from '@/loaders/listings';
import type { Application } from '@/types/application';
import { formatApplicationStatusDisplay } from '@/utils/formatters/applications';

import { Applications, ApplicationsEmpty } from './index';

export function applicationsRoute(queryClient: QueryClient) {
  return {
    path: 'applications',
    handle: { breadcrumb: 'Applications' },
    element: <Outlet />,
    errorElement: <ErrorElement />,
    children: [
      {
        index: true,
        element: <ApplicationsEmpty />,
        loader: applicationsListRedirectLoader(queryClient),
      },
      {
        path: ':applicationId',
        element: <Applications />,
        loader: applicationLoader(queryClient),
        handle: {
          breadcrumb: (data: { application: Application }) =>
            formatApplicationStatusDisplay(data.application),
        },
        errorElement: <ErrorElement />,
      },
    ],
  };
}
