import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useDebouncedMutation } from '@/hooks/useDebouncedMutation';
import {
  generateListingInsights as generateListingInsightsSvc,
  ingestListing as ingestListingSvc,
  saveListing as saveListingSvc,
  updateListingNotes as updateListingNotesSvc,
} from '@/services/listings';
import type { ListingDraft, ListingDraftPending } from '@/types/listingDraft';

// Individual hooks for server-side listing mutations

export function useIngestListing() {
  const queryClient = useQueryClient();

  const { mutate: runIngest } = useMutation({
    mutationFn: ({ id, url, content }: { id: string; url: string; content?: string }) =>
      ingestListingSvc(url, content, id),
    onSuccess: (newDraft) => {
      queryClient.setQueryData<ListingDraft[]>(
        ['listing-drafts'],
        (old) => old?.map((l) => (l.id === newDraft.id ? newDraft : l)) ?? []
      );
    },
    onError: (error, variables) => {
      queryClient.setQueryData<ListingDraft[]>(
        ['listing-drafts'],
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
      queryClient.setQueryData<ListingDraft[]>(['listing-drafts'], (old) => [
        ...(old ?? []),
        { id, url, status: 'pending' } as ListingDraftPending,
      ]);
    } else {
      queryClient.setQueryData<ListingDraft[]>(
        ['listing-drafts'],
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
      const previousListings = queryClient.getQueryData<ListingDraft[]>(['listing-drafts']);

      queryClient.setQueryData(['listing-drafts'], (old: ListingDraft[] | undefined) => {
        return old?.filter((l) => l.id !== listing.id) || [];
      });

      return { previousListings };
    },
    onError: (_err, _listing, context) => {
      if (context?.previousListings) {
        queryClient.setQueryData(['listing-drafts'], context.previousListings);
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
      queryClient.setQueryData(['listing', updatedListing.id], updatedListing);
    },
    delay: 500,
  });

  return updateNotes;
}

export function useGenerateListingInsights() {
  const queryClient = useQueryClient();

  const { mutate: generateInsights, isPending: isGeneratingInsights } = useMutation({
    mutationFn: (listingId: string) => generateListingInsightsSvc(listingId),
    onSuccess: (updatedListing) => {
      queryClient.setQueryData(['listing', updatedListing.id], updatedListing);
    },
  });

  return { generateInsights, isGeneratingInsights };
}
