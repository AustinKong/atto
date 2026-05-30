import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useDebouncedMutation } from '@/hooks/use-debounced-mutation.hooks';
import { listingDraftQueries } from '@/queries/listing-draft.queries';
import type {
  ListingDraft,
  ListingDraftPending,
  ListingExtraction,
} from '@/types/listing-draft.types';

// Individual hooks for client-side listing draft mutations

type PatchListingDraftContentVariables = {
  id: string;
  updates: Partial<ListingExtraction>;
};

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

export function useDebouncedPatchListingDraftContent() {
  const queryClient = useQueryClient();

  return useDebouncedMutation<Partial<ListingExtraction>, Error, PatchListingDraftContentVariables>(
    {
      delay: 700,
      mutationFn: async ({ id, updates }) => {
        queryClient.setQueryData<ListingDraft[]>(listingDraftQueries.keys.list(), (old) => {
          return (
            old?.map((draft) => {
              if (draft.id !== id) return draft;
              if (!('listing' in draft)) return draft;

              return { ...draft, listing: { ...draft.listing, ...updates } };
            }) ?? []
          );
        });
        return updates;
      },
    }
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
