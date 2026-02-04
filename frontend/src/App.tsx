import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router';

import { DashboardLayout } from '@/components/layouts/dashboard';
import { Toaster } from '@/components/ui/toaster';
import { listingsRoute } from '@/pages/listings-page/route';
import { newListingsRoute } from '@/pages/new-listings-page/route';
import { releaseNotesRoute } from '@/pages/release-notes-page/route';
import { resumeRoute } from '@/pages/resume-page/route';
import { settingsRoute } from '@/pages/settings-page/route';
import { queryClient } from '@/utils/queryClient';

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
        ],
      },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
