import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import { getListing, getListingResearchStatus, getListings } from '@/services/listing.service';
import type { StatusEnum } from '@/types/application.types';

type ListingListParams = {
  search?: string;
  sortBy?: 'title' | 'company' | 'posted_at' | 'last_status_at';
  sortOrder?: 'asc' | 'desc';
  statuses?: StatusEnum[];
  pageSize?: number;
};

const listingQueryKeys = {
  root: () => ['listing'] as const,
  listRoot: () => [...listingQueryKeys.root(), 'list'] as const,
  list: (params: ListingListParams = {}) =>
    [
      ...listingQueryKeys.listRoot(),
      params.search ?? '',
      params.sortBy ?? '',
      params.sortOrder ?? '',
      params.statuses ?? [],
      params.pageSize ?? 50,
    ] as const,
  item: (id: string) => [...listingQueryKeys.root(), 'item', id] as const,
  researchStatus: (id: string) => [...listingQueryKeys.item(id), 'research-status'] as const,
};

export const listingsQueries = {
  keys: listingQueryKeys,
  list: (
    params: {
      search?: string;
      sortBy?: 'title' | 'company' | 'posted_at' | 'last_status_at';
      sortOrder?: 'asc' | 'desc';
      statuses?: StatusEnum[];
      pageSize?: number;
    } = {}
  ) => {
    const { search, sortBy, sortOrder, statuses, pageSize = 50 } = params;

    return infiniteQueryOptions({
      initialPageParam: 1,
      queryKey: listingQueryKeys.list(params),
      queryFn: async ({ pageParam }) => {
        return getListings(
          pageParam,
          pageSize,
          search,
          statuses?.length ? statuses : undefined,
          sortBy,
          sortOrder
        );
      },
      getNextPageParam: (lastPage) => {
        if (lastPage.page < lastPage.pages) return lastPage.page + 1;
        return undefined;
      },
    });
  },

  item: (id: string) =>
    queryOptions({
      queryKey: listingQueryKeys.item(id),
      queryFn: () => getListing(id),
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),

  researchStatus: (id: string) =>
    queryOptions({
      queryKey: listingQueryKeys.researchStatus(id),
      queryFn: () => getListingResearchStatus(id),
    }),
};
