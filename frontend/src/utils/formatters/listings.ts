import type { Listing } from '@/types/listing';

export function formatListingBreadcrumb(listing: Listing): string {
  return `${listing.title} at ${listing.company}`;
}
