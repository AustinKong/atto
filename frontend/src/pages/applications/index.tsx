import { Text, VStack } from '@chakra-ui/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { applicationQueries } from '@/queries/application.queries';
import { listingsQueries } from '@/queries/listing.queries';

import { Details } from './Details';
import { StatusEventModal, StatusEventProvider } from './status-event-modal';
import { Timeline } from './Timeline';

function SelectedApplicationTimeline({ applicationId }: { applicationId: string }) {
  const { data: application } = useSuspenseQuery(applicationQueries.item(applicationId));

  return <Timeline application={application} />;
}

export function Applications() {
  const { listingId } = useParams<{ listingId: string }>();
  const { data: listing } = useSuspenseQuery(listingsQueries.item(listingId!));

  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);

  useEffect(() => {
    const firstApplicationId = listing.applications[0]?.id ?? null;

    if (!selectedApplicationId) {
      setSelectedApplicationId(firstApplicationId);
      return;
    }

    const selectedStillExists = listing.applications.some((app) => app.id === selectedApplicationId);

    if (!selectedStillExists) {
      setSelectedApplicationId(firstApplicationId);
    }
  }, [listing.applications, selectedApplicationId]);

  const selectedApplication =
    listing.applications.find((application) => application.id === selectedApplicationId) ?? null;

  return (
    <StatusEventProvider>
      <VStack align="stretch" gap="md" px="md" mb="md">
        <Details
          application={selectedApplication}
          listing={listing}
          selectedApplicationId={selectedApplicationId}
          onSelectApplication={setSelectedApplicationId}
          onApplicationCreated={setSelectedApplicationId}
        />

        {selectedApplicationId ? (
          <SelectedApplicationTimeline applicationId={selectedApplicationId} />
        ) : (
          <Text color="fg.muted">No application selected.</Text>
        )}
      </VStack>
      <StatusEventModal />
    </StatusEventProvider>
  );
}
