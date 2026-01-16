import { useOutletContext } from 'react-router';

import type { Listing } from '@/types/listing';

export type DrawerContext = {
  listing: Listing;
};

export function useDrawerContext() {
  return useOutletContext<DrawerContext>();
}
