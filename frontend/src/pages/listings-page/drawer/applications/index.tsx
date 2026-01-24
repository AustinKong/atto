import { Heading, IconButton, Text, VStack } from '@chakra-ui/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import React from 'react';
import { PiPlus } from 'react-icons/pi';
import { useNavigate, useParams } from 'react-router';

import { useCreateApplication } from '@/mutations/applications';
import { applicationQueries } from '@/queries/applications';
import { listingsQueries } from '@/queries/listings';

import { Details } from './Details';
import { StatusEventModal, StatusEventProvider } from './status-event-modal';
import { Timeline } from './Timeline';

export function ApplicationsEmpty() {
  const navigate = useNavigate();
  const { listingId } = useParams<{ listingId: string }>();
  const { data: listing } = useSuspenseQuery(listingsQueries.item(listingId!));

  const createApplicationMutation = useCreateApplication();

  // Redirect to first application if there are applications
  React.useEffect(() => {
    if (listing.applications && listing.applications.length > 0 && listing.applications[0].id) {
      navigate(`/listings/${listingId}/applications/${listing.applications[0].id}`, {
        replace: true,
      });
    }
  }, [listing, listingId, navigate]);

  const handleCreateApplication = async () => {
    await createApplicationMutation.mutateAsync(listing.id);
  };

  // If there are applications, don't render anything (redirect will happen)
  if (listing.applications && listing.applications.length > 0) {
    return null;
  }

  return (
    <VStack align="stretch" gap="4" px="4" mb="4">
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
        onClick={handleCreateApplication}
        disabled={createApplicationMutation.isPending}
      >
        <PiPlus />
        {createApplicationMutation.isPending ? 'Creating...' : 'New Application'}
      </IconButton>
    </VStack>
  );
}

export function Applications() {
  const { listingId, applicationId } = useParams<{ listingId: string; applicationId: string }>();
  const { data: listing } = useSuspenseQuery(listingsQueries.item(listingId!));
  const createApplicationMutation = useCreateApplication();

  const handleCreateApplication = async () => {
    await createApplicationMutation.mutateAsync(listing.id);
    // Navigation will be handled by the route redirect
    // TODO: Not sure what to do with this
  };

  const { data: application } = useSuspenseQuery(applicationQueries.item(applicationId!));

  if (!applicationId) {
    return <div>Application ID is required</div>;
  }

  return (
    <StatusEventProvider>
      <VStack align="stretch" gap="4" px="4" mb="4">
        <Details
          application={application}
          listing={listing}
          handleCreateApplication={handleCreateApplication}
        />
        <Timeline application={application} />
      </VStack>
      <StatusEventModal />
    </StatusEventProvider>
  );
}
