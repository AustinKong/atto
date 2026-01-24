import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import { getListing, getListings } from '@/services/listings';
import type { StatusEnum } from '@/types/application';

export const listingsQueries = {
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

    const queryKey = [
      'listings',
      search ?? '',
      sortBy ?? '',
      sortOrder ?? '',
      statuses ?? [],
    ] as const;

    return infiniteQueryOptions({
      initialPageParam: 1,
      queryKey,
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

  // Convenience factory for callers that only want to prefetch the first page
  // during a route transition (e.g. loader).
  all: () =>
    queryOptions({
      queryKey: ['listings', '', '', '', []] as const,
      queryFn: () => getListings(1, 50),
    }),

  // Single listing query factory
  item: (id: string) =>
    queryOptions({
      queryKey: ['listing', id] as const,
      queryFn: () => getListing(id),
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),
};
