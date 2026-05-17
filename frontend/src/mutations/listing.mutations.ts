import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useDebouncedMutation } from '@/hooks/use-debounced-mutation.hooks';
import { listingsQueries } from '@/queries/listing.queries';
import { listingDraftQueries } from '@/queries/listing-draft.queries';
import {
  generateListingResearch as generateListingResearchSvc,
  ingestListing as ingestListingSvc,
  saveListing as saveListingSvc,
  updateListingNotes as updateListingNotesSvc,
} from '@/services/listing.service';
import type { ListingDraft, ListingDraftPending } from '@/types/listing-draft.types';

// Individual hooks for server-side listing mutations

export function useIngestListing() {
  const queryClient = useQueryClient();

  const { mutate: runIngest } = useMutation({
    mutationFn: ({ id, url, content }: { id: string; url: string; content?: string }) =>
      ingestListingSvc(url, content, id),
    onSuccess: (newDraft) => {
      queryClient.setQueryData<ListingDraft[]>(
        listingDraftQueries.keys.list(),
        (old) => old?.map((l) => (l.id === newDraft.id ? newDraft : l)) ?? []
      );
    },
    onError: (error, variables) => {
      queryClient.setQueryData<ListingDraft[]>(
        listingDraftQueries.keys.list(),
        (old) =>
          old?.map((l) =>
            l.id === variables.id
              ? ({
                  id: variables.id,
                  url: variables.url,
                  status: 'error',
                  error: (error as Error).message,
                  html: null,
                } as ListingDraft)
              : l
          ) ?? []
      );
    },
  });

  return (url: string, content?: string, existingId?: string) => {
    const id = existingId ?? crypto.randomUUID();
    const isNew = !existingId;

    if (isNew) {
      queryClient.setQueryData<ListingDraft[]>(listingDraftQueries.keys.list(), (old) => [
        ...(old ?? []),
        { id, url, status: 'pending' } as ListingDraftPending,
      ]);
    } else {
      queryClient.setQueryData<ListingDraft[]>(
        listingDraftQueries.keys.list(),
        (old) =>
          old?.map((l) =>
            l.id === id ? ({ id: l.id, url: l.url, status: 'pending' } as ListingDraftPending) : l
          ) ?? []
      );
    }

    runIngest({ id, url, content });

    return id;
  };
}

export function useSaveListings() {
  const queryClient = useQueryClient();

  const { mutateAsync: saveListing } = useMutation({
    mutationFn: saveListingSvc,
    onMutate: (listing: ListingDraft) => {
      const previousListings = queryClient.getQueryData<ListingDraft[]>(
        listingDraftQueries.keys.list()
      );

      queryClient.setQueryData(
        listingDraftQueries.keys.list(),
        (old: ListingDraft[] | undefined) => {
          return old?.filter((l) => l.id !== listing.id) || [];
        }
      );

      return { previousListings };
    },
    onSuccess: () => {
      // Invalidate the listings list so it refetches with the newly saved listing
      queryClient.invalidateQueries({ queryKey: listingsQueries.keys.listRoot() });
    },
    onError: (_err, _listing, context) => {
      if (context?.previousListings) {
        queryClient.setQueryData(listingDraftQueries.keys.list(), context.previousListings);
      }
    },
  });

  return async (listings: ListingDraft[]) => {
    return Promise.allSettled(listings.map((listing) => saveListing(listing)));
  };
}

export function useUpdateListingNotes() {
  const queryClient = useQueryClient();

  const { mutate: updateNotes } = useDebouncedMutation({
    mutationFn: ({ listingId, notes }: { listingId: string; notes: string | null }) =>
      updateListingNotesSvc(listingId, notes),
    onSuccess: (updatedListing) => {
      queryClient.setQueryData(listingsQueries.keys.item(updatedListing.id), updatedListing);
    },
    delay: 500,
  });

  return updateNotes;
}

export function useGenerateListingResearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listingId: string) => generateListingResearchSvc(listingId),
    onSuccess: (data, listingId) => {
      queryClient.setQueryData(listingsQueries.keys.researchStatus(listingId), data);
    },
  });
}
