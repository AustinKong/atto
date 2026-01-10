import { Center, Heading, HStack, IconButton, Spinner, Text, VStack } from '@chakra-ui/react';
import { PiPlus } from 'react-icons/pi';
import { Navigate, useNavigate, useParams } from 'react-router';

import { useApplicationMutations, useApplicationQuery } from '@/hooks/applications';
import { useListingQuery } from '@/hooks/listings';

import { Details } from './Details';
import { Timeline } from './Timeline';

export function Applications() {
  const navigate = useNavigate();
  const { listingId, applicationId } = useParams<{ listingId: string; applicationId?: string }>();
  const { data: listing } = useListingQuery(listingId!);
  const { application: selectedApplication, isLoading } = useApplicationQuery(
    applicationId || null
  );

  const { createApplication, isCreateApplicationLoading } = useApplicationMutations();

  if (!listing) {
    return null;
  }

  if (isLoading) {
    return (
      <Center h="full">
        <Spinner size="lg" />
      </Center>
    );
  }

  const hasApplications = listing.applications && listing.applications.length > 0;
  if (!applicationId && hasApplications) {
    return (
      <Navigate to={`/listings/${listingId}/applications/${listing.applications[0].id}`} replace />
    );
  }

  const handleCreateApplication = async () => {
    const { id } = await createApplication(listing.id);
    navigate(`/listings/${listingId}/applications/${id}`, { replace: true });
  };

  if (!hasApplications) {
    return (
      <VStack align="stretch" gap="4" px="4" mb="4">
        <VStack align="stretch" gap="0">
          <HStack justify="space-between">
            <Heading size="md">Applications</Heading>
          </HStack>
          <Text color="fg.muted" mt="4">
            No applications yet. Create your first application to track your progress.
          </Text>
          <IconButton
            aria-label="Create application"
            variant="solid"
            size="md"
            mt="4"
            onClick={handleCreateApplication}
            disabled={isCreateApplicationLoading}
            w="fit-content"
          >
            <PiPlus />
            {isCreateApplicationLoading ? 'Creating...' : 'New Application'}
          </IconButton>
        </VStack>
      </VStack>
    );
  }

  const application = selectedApplication || listing.applications[0];

  return (
    <VStack align="stretch" gap="4" px="4" mb="4">
      <Details application={application} applications={listing.applications} />
      <Timeline application={application} />
    </VStack>
  );
}
