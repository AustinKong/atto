import { Box } from '@chakra-ui/react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router';

import { AuthLayout } from '@/components/layouts/auth';
import { DashboardLayout } from '@/components/layouts/dashboard';
import { Toaster } from '@/components/ui/Toaster';
import { applicationsRoute } from '@/pages/applications/route';
import { listingsRoute } from '@/pages/listings/route';
import { newListingsRoute } from '@/pages/new-listings/route';
import { releaseNotesRoute } from '@/pages/release-notes/route';
import { applicationResumeRoute, resumeRoute } from '@/pages/resume/route';
import { settingsRoute } from '@/pages/settings/route';
import { signinRoute } from '@/pages/signin/route';
import { signupRoute } from '@/pages/signup/route';
import { templateBuilderRoute } from '@/pages/template-builder/route';
import { templatesRoute } from '@/pages/templates/route';
import { ErrorElement } from '@/routes/base-route/ErrorElement';
import { queryClient } from '@/utils/query-client.utils';

export const router = createBrowserRouter([
  {
    element: (
      <>
        <Outlet />
        <Toaster />
      </>
    ),
    errorElement: (
      <Box h="100vh">
        <ErrorElement />
      </Box>
    ),
    children: [
      {
        element: <AuthLayout />,
        children: [signinRoute(), signupRoute()],
      },
      {
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="listings" replace />,
          },
          releaseNotesRoute(queryClient),
          listingsRoute(queryClient),
          applicationsRoute(queryClient),
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

export { baseRoute } from './base-route';
