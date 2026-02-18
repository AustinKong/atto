import type { QueryClient } from '@tanstack/react-query';

import { ErrorElement } from '@/components/ui/ErrorBoundary';
import { profileQueries } from '@/queries/profile';
import { templateQueries } from '@/queries/template';

import { ProfilePage } from './index';

function profileLoader(queryClient: QueryClient) {
  return async () => {
    await Promise.all([
      queryClient.ensureQueryData(profileQueries.item()),
      queryClient.ensureQueryData(templateQueries.default()),
    ]);
  };
}

export function profileRoute(queryClient: QueryClient) {
  return {
    path: 'profile',
    element: <ProfilePage />,
    loader: profileLoader(queryClient),
    errorElement: <ErrorElement />,
  };
}
