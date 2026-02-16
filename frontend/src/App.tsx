import { Box } from '@chakra-ui/react';
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router';

import { DashboardLayout } from '@/components/layouts/dashboard';
import { ErrorElement } from '@/components/ui/ErrorBoundary';
import { Toaster } from '@/components/ui/toaster';
import { listingsRoute } from '@/pages/listings-page/route';
import { newListingsRoute } from '@/pages/new-listings-page/route';
import { releaseNotesRoute } from '@/pages/release-notes-page/route';
import { resumeRoute } from '@/pages/resume-page/route';
import { settingsRoute } from '@/pages/settings-page/route';
import { templateBuilderRoute } from '@/pages/template-builder-page/route';
import { templatesRoute } from '@/pages/templates-page/route';
import { queryClient } from '@/utils/queryClient';

import { ProfilePage } from './pages/profile-page';

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
          newListingsRoute(),
          resumeRoute(queryClient),
          settingsRoute(queryClient),
          templateBuilderRoute,
          templatesRoute,
          {
            path: '/profile',
            element: <ProfilePage />,
          },
        ],
      },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
