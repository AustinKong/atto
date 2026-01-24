import { Outlet } from 'react-router';

import { ErrorElement } from '@/components/ui/ErrorBoundary';

import { Applications, ApplicationsEmpty } from './index';

export function applicationsRoute() {
  return {
    path: 'applications',
    element: <Outlet />,
    errorElement: <ErrorElement />,
    children: [
      { index: true, element: <ApplicationsEmpty /> },
      {
        path: ':applicationId',
        element: <Applications />,
        errorElement: <ErrorElement />,
      },
    ],
  };
}
