import { Box } from '@chakra-ui/react';
import { createBrowserRouter, Outlet } from 'react-router';

import { DashboardLayout } from '@/components/layouts/dashboard';
import { Toaster } from '@/components/ui/Toaster';
import { authRoute } from '@/pages/auth/route';
import { dashboardRoute } from '@/pages/dashboard/route';
import { listingsRoute } from '@/pages/listings/route';
import { newListingsRoute } from '@/pages/new-listings/route';
import { onboardingRoute } from '@/pages/onboarding/route';
import { releaseNotesRoute } from '@/pages/release-notes/route';
import { applicationResumeRoute, resumeRoute } from '@/pages/resume/route';
import { settingsRoute } from '@/pages/settings/route';
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
      authRoute(),
      onboardingRoute(),
      {
        element: <DashboardLayout />,
        children: [
          dashboardRoute(queryClient),
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

export { baseRoute } from './base-route';
