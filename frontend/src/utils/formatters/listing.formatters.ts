import type { Listing } from '@/types/listing.types';

export function formatListingBreadcrumb(listing: Listing): string {
  return `${listing.title} at ${listing.company}`;
}

export function formatSalary(salary: { value: number; currency: string }): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: salary.currency, maximumFractionDigits: 0 }).format(salary.value);
}
