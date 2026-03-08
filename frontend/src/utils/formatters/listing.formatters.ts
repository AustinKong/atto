import type { Listing } from '@/types/listing.types';

export function formatListingBreadcrumb(listing: Listing): string {
  return `${listing.title} at ${listing.company}`;
}
