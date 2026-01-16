import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Outlet,
  redirect,
  Route,
  RouterProvider,
} from 'react-router';

import { DashboardLayout } from '@/components/layouts/dashboard';
import { Toaster } from '@/components/ui/toaster';
import { AboutPage } from '@/pages/about-page';
import { ListingsPage } from '@/pages/listings-page';
import { Applications, Info, ListingDrawer } from '@/pages/listings-page/drawer';
import { NewListingsPage } from '@/pages/new-listings-page';
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

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<RootLayout />}>
      <Route element={<DashboardLayout />}>
        <Route index element={<Navigate to="listings" replace />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="listings" element={<ListingsPage />}>
          <Route path=":listingId" element={<ListingDrawer />}>
            <Route index element={<Info />} />
            <Route path="research" element={<div>Research content coming soon</div>} />
            <Route
              path="applications"
              element={<Applications />}
              loader={async ({ params }) => {
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
              }}
            />
            <Route path="applications/:applicationId" element={<Applications />} />
          </Route>
        </Route>
        <Route path="listings/new" element={<NewListingsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Route>
  )
);

export function App() {
  return <RouterProvider router={router} />;
}
