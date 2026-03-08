import { Box } from '@chakra-ui/react';
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router';

import { DashboardLayout } from '@/components/layouts/dashboard';
import { ErrorElement } from '@/components/ui/ErrorBoundary';
import { Toaster } from '@/components/ui/Toaster';
import { listingsRoute } from '@/pages/listings/route';
import { newListingsRoute } from '@/pages/new-listings/route';
import { releaseNotesRoute } from '@/pages/release-notes/route';
import { applicationResumeRoute, resumeRoute } from '@/pages/resume/route';
import { settingsRoute } from '@/pages/settings/route';
import { templateBuilderRoute } from '@/pages/template-builder/route';
import { templatesRoute } from '@/pages/templates/route';
import { queryClient } from '@/utils/query-client.utils';

function RootLayout() {
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: (
      <Box h="100vh">
        <ErrorElement />
      </Box>
    ),
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="listings" replace />,
          },
          releaseNotesRoute(queryClient),
          listingsRoute(queryClient),
          applicationResumeRoute(queryClient),
          newListingsRoute(),
          resumeRoute(queryClient),
          settingsRoute(queryClient),
          templateBuilderRoute(),
          templatesRoute(),
        ],
      },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
