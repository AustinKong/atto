import { Center, Spinner } from '@chakra-ui/react';
import { Suspense } from 'react';

import { ErrorElement } from '@/components/ui/ErrorBoundary';

import { applicationsRoute } from './applications/route.tsx';
import { ListingDrawer } from './index';
import { infoRoute } from './info/route';
import { researchRoute } from './research/route';

export const listingDrawerRoute = () => ({
  path: ':listingId',
  element: (
    <Suspense
      fallback={
        <Center h="full">
          <Spinner />
        </Center>
      }
    >
      <ListingDrawer />
    </Suspense>
  ),
  errorElement: <ErrorElement />,
  children: [infoRoute(), researchRoute(), applicationsRoute()],
});
