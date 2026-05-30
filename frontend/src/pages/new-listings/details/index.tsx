import { EmptyState, VStack } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { PiBrowser } from 'react-icons/pi';
import z from 'zod';

import { useWatchForm } from '@/hooks/use-watch-form.hooks';
import { useDebouncedPatchListingDraftContent } from '@/mutations/listing-draft.mutations';
import type {
  ListingDraft,
  ListingDraftError,
  ListingDraftPending,
} from '@/types/listing-draft.types';
import type { ISODate } from '@/utils/date.utils';

import { FormFields } from './FormFields';
import { Header } from './Header';

const requirementSchema = z.object({
  value: z.string(),
});

const detailsSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  company: z.string().min(1, 'Company is required'),
  location: z.string(),
  description: z.string(),
  requirements: z.array(requirementSchema),
  skills: z.array(z.string()),
  postedDate: z.custom<ISODate | null>((val) => val === null || typeof val === 'string'),
});

export type FormValues = z.infer<typeof detailsSchema>;

export function Details({ listingDraft }: { listingDraft: ListingDraft | null }) {
  if (!listingDraft) {
    return (
      <EmptyState.Root h="full">
        <EmptyState.Content h="full">
          <EmptyState.Indicator>
            <PiBrowser />
          </EmptyState.Indicator>
          <VStack textAlign="center">
            <EmptyState.Title>No Listing Selected</EmptyState.Title>
            <EmptyState.Description>
              Select a listing from the list to view its details and source
            </EmptyState.Description>
          </VStack>
        </EmptyState.Content>
      </EmptyState.Root>
    );
  }

  // TODO: Split into ifs, or merge all three
  if (listingDraft.status === 'pending' || listingDraft.status === 'error') {
    return (
      <EmptyState.Root h="full">
        <EmptyState.Content h="full">
          <EmptyState.Indicator>
            <PiBrowser />
          </EmptyState.Indicator>
          <VStack textAlign="center">
            <EmptyState.Title>
              {listingDraft.status === 'pending'
                ? 'Listing is being scraped'
                : 'Error loading listing'}
            </EmptyState.Title>
            <EmptyState.Description>
              {listingDraft.status === 'pending'
                ? 'Please wait while we fetch the listing details'
                : listingDraft.error || 'An error occurred while loading the listing'}
            </EmptyState.Description>
          </VStack>
        </EmptyState.Content>
      </EmptyState.Root>
    );
  }

  return <DetailsForm key={listingDraft.id} listingDraft={listingDraft} />;
}

function DetailsForm({
  listingDraft,
}: {
  listingDraft: Exclude<ListingDraft, ListingDraftPending | ListingDraftError>;
}) {
  const { mutate: patchListingDraftContent } = useDebouncedPatchListingDraftContent();
  const isReadOnly = listingDraft.status === 'duplicate_url';

  const {
    register,
    control,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: getFormValues(listingDraft),
  });

  useWatchForm<FormValues>((value) => {
    if (isReadOnly) return;

    const result = detailsSchema.safeParse(value);
    if (!result.success) return;

    patchListingDraftContent({
      id: listingDraft.id,
      updates: toListingPatch(result.data),
    });
  }, watch);

  return (
    <VStack
      align="stretch"
      p="md"
      gap="md"
      h="full"
      minW="0"
      overflowY="auto"
      overflowX="hidden"
    >
      <Header listingDraft={listingDraft} />
      <FormFields register={register} control={control} isReadOnly={isReadOnly} />
    </VStack>
  );
}

function toListingPatch(data: FormValues) {
  return {
    ...data,
    requirements: data.requirements.map((r) => r.value).filter((r) => r.trim()),
    skills: data.skills.filter((s) => s.trim()),
  };
}

function getFormValues(
  draft: Exclude<ListingDraft, ListingDraftPending | ListingDraftError>
): FormValues {
  const data = draft.status === 'duplicate_url' ? draft.duplicateOf : draft.listing;

  return {
    title: data.title,
    company: data.company,
    location: data.location ?? '',
    description: data.description,
    requirements: data.requirements.map((requirement) => ({ value: requirement })),
    skills: data.skills,
    postedDate: data.postedDate,
  };
}
