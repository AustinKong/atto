import { Center, Heading, IconButton, Spinner, Text, VStack } from '@chakra-ui/react';
import { PiPlus } from 'react-icons/pi';
import { useNavigate, useParams } from 'react-router';

import { useApplicationMutations, useApplicationQuery } from '@/hooks/applications';
import { useDrawerContext } from '@/pages/listings-page/drawer/drawerContext';

import { Details } from './Details';
import { StatusEventModal, StatusEventProvider } from './status-event-modal';
import { Timeline } from './Timeline';

export function Applications() {
  const navigate = useNavigate();
  const { applicationId } = useParams<{ applicationId?: string }>();
  const { listing } = useDrawerContext();
  const { application, isLoading } = useApplicationQuery(applicationId);

  const { createApplication, isCreateApplicationLoading } = useApplicationMutations();

  if (isLoading) {
    return (
      <Center h="full">
        <Spinner size="lg" />
      </Center>
    );
  }

  const handleCreateApplication = async () => {
    const { id } = await createApplication(listing.id);
    navigate(`/listings/${listing.id}/applications/${id}`, { replace: true });
  };

  if (!applicationId) {
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
          disabled={isCreateApplicationLoading}
        >
          <PiPlus />
          {isCreateApplicationLoading ? 'Creating...' : 'New Application'}
        </IconButton>
      </VStack>
    );
  }

  if (!application) {
    return (
      <Center h="full">
        <Text>Application not found.</Text>
      </Center>
    );
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
