import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import type { ListingDraft, ListingDraftPending, ListingExtraction } from '@/types/listingDraft';

// Individual hooks for client-side listing draft mutations

export function useSetListingDraft() {
  const queryClient = useQueryClient();

  return useCallback(
    (id: string, listing: ListingDraft) => {
      queryClient.setQueryData<ListingDraft[]>(
        ['listing-drafts'],
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
        ['listing-drafts'],
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
      queryClient.setQueryData<ListingDraft[]>(['listing-drafts'], (old) => [
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
      queryClient.setQueryData<ListingDraft[]>(['listing-drafts'], (old) => {
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
        ['listing-drafts'],
        (old) => old?.filter((l) => !ids.includes(l.id)) ?? []
      );
    },
    [queryClient]
  );
}
