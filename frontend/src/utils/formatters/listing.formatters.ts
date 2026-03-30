import type { Listing } from '@/types/listing.types';

export function formatListingBreadcrumb(listing: Listing): string {
  return `${listing.title} at ${listing.company}`;
}

export function formatSalary(
  salary: { value: number; currency: string },
  variant: 'long' | 'short' = 'long'
): string {
  if (variant === 'short') {
    const symbol = salary.currency === 'USD' ? '$' : salary.currency + ' ';
    return `${symbol}${Math.round(salary.value / 1000)}k`;
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: salary.currency, maximumFractionDigits: 0 }).format(salary.value);
}
