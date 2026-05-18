import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { listingDraftQueries } from '@/queries/listing-draft.queries';
import type {
  ListingDraft,
  ListingDraftPending,
  ListingExtraction,
} from '@/types/listing-draft.types';

// Individual hooks for client-side listing draft mutations

export function useSetListingDraft() {
  const queryClient = useQueryClient();

  return useCallback(
    (id: string, listing: ListingDraft) => {
      queryClient.setQueryData<ListingDraft[]>(
        listingDraftQueries.keys.list(),
        (old) => old?.map((l) => (l.id === id ? listing : l)) ?? []
      );
    },
    [queryClient]
  );
}

export function useSetPendingListingDraft() {
  const queryClient = useQueryClient();

  return useCallback(
    (id: string) => {
      queryClient.setQueryData<ListingDraft[]>(
        listingDraftQueries.keys.list(),
        (old) =>
          old?.map((l) =>
            l.id === id ? ({ id: l.id, url: l.url, status: 'pending' } as ListingDraftPending) : l
          ) ?? []
      );
    },
    [queryClient]
  );
}

export function useAddPendingListingDraft() {
  const queryClient = useQueryClient();

  return useCallback(
    (id: string, url: string) => {
      queryClient.setQueryData<ListingDraft[]>(listingDraftQueries.keys.list(), (old) => [
        ...(old ?? []),
        { id, url, status: 'pending' } as ListingDraftPending,
      ]);
    },
    [queryClient]
  );
}

export function usePatchListingDraftContent() {
  const queryClient = useQueryClient();

  return useCallback(
    (id: string, updates: Partial<ListingExtraction>) => {
      queryClient.setQueryData<ListingDraft[]>(listingDraftQueries.keys.list(), (old) => {
        return (
          old?.map((l) => {
            if (l.id !== id) return l;
            if (!('listing' in l)) return l;

            return { ...l, listing: { ...l.listing, ...updates } };
          }) ?? []
        );
      });
    },
    [queryClient]
  );
}

export function useDiscardListingDrafts() {
  const queryClient = useQueryClient();

  return useCallback(
    (ids: string[]) => {
      queryClient.setQueryData<ListingDraft[]>(
        listingDraftQueries.keys.list(),
        (old) => old?.filter((l) => !ids.includes(l.id)) ?? []
      );
    },
    [queryClient]
  );
}
