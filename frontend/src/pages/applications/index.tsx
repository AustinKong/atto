import { Heading, IconButton, Text, useDisclosure, VStack } from '@chakra-ui/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { PiPlus } from 'react-icons/pi';
import { useParams } from 'react-router';

import { useCreateApplication } from '@/mutations/application.mutations';
import { applicationQueries } from '@/queries/application.queries';
import { listingsQueries } from '@/queries/listing.queries';

import { CreateApplicationModal } from './CreateApplicationModal';
import { Details } from './Details';
import { SkillsComparison } from './SkillsComparison';
import { StatusEventModal, StatusEventProvider } from './status-event-modal';
import { Timeline } from './Timeline';

export function ApplicationsEmpty() {
  const { listingId } = useParams<{ listingId: string }>();
  const { open, onOpen, setOpen } = useDisclosure();
  useSuspenseQuery(listingsQueries.item(listingId!));
  const createApplicationMutation = useCreateApplication();

  return (
    <>
      <VStack align="stretch" gap="md" px="md" mb="md">
        <VStack align="stretch">
          <Heading size="md">Applications</Heading>
          <Text color="fg.muted">
            No applications yet. Create your first application to track your progress.
          </Text>
        </VStack>
        <IconButton
          aria-label="Create application"
          variant="solid"
          size="md"
          onClick={onOpen}
          disabled={createApplicationMutation.isPending}
        >
          <PiPlus />
          {createApplicationMutation.isPending ? 'Creating...' : 'New Application'}
        </IconButton>
      </VStack>
      <CreateApplicationModal open={open} onOpenChange={setOpen} />
    </>
  );
}

export function Applications() {
  const { listingId, applicationId } = useParams<{ listingId: string; applicationId: string }>();
  const { data: listing } = useSuspenseQuery(listingsQueries.item(listingId!));

  const { data: application } = useSuspenseQuery(applicationQueries.item(applicationId!));

  if (!applicationId) {
    return <div>Application ID is required</div>;
  }

  return (
    <StatusEventProvider>
      <VStack align="stretch" gap="md" px="md" mb="md">
        <Details application={application} listing={listing} />
        <SkillsComparison applicationId={applicationId} listingId={listingId!} />
        <Timeline application={application} />
      </VStack>
      <StatusEventModal />
    </StatusEventProvider>
  );
}
