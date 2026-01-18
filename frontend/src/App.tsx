import { createBrowserRouter, Navigate, Outlet, redirect, RouterProvider } from 'react-router';

import { DashboardLayout } from '@/components/layouts/dashboard';
import { Toaster } from '@/components/ui/toaster';
import { AboutPage } from '@/pages/about-page';
import { ListingsPage } from '@/pages/listings-page';
import { Applications, Info, ListingDrawer, Research } from '@/pages/listings-page/drawer';
import { NewListingsPage } from '@/pages/new-listings-page';
import { ResumePage } from '@/pages/resume-page';
import { SettingsPage } from '@/pages/settings-page';
import { getListing } from '@/services/listings';
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
          {
            path: 'about',
            element: <AboutPage />,
          },
          {
            path: 'listings',
            element: <ListingsPage />,
            children: [
              {
                path: ':listingId',
                element: <ListingDrawer />,
                children: [
                  {
                    index: true,
                    element: <Info />,
                  },
                  {
                    path: 'research',
                    element: <Research />,
                  },
                  {
                    path: 'applications',
                    element: <Applications />,
                    loader: async ({ params }) => {
                      const listingId = params.listingId!;

                      const listing = await queryClient.ensureQueryData({
                        queryKey: ['listing', listingId],
                        queryFn: () => getListing(listingId),
                      });

                      if (listing.applications.length > 0) {
                        return redirect(
                          `/listings/${listingId}/applications/${listing.applications[0].id}`
                        );
                      }
                      return null;
                    },
                  },
                  {
                    path: 'applications/:applicationId',
                    element: <Applications />,
                  },
                ],
              },
            ],
          },
          {
            path: 'listings/new',
            element: <NewListingsPage />,
          },
          {
            path: 'resumes/:resumeId',
            element: <ResumePage />,
          },
          {
            path: 'settings',
            element: <SettingsPage />,
          },
        ],
      },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
