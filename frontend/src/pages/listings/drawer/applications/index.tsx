import { VStack } from '@chakra-ui/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';

import { listingsQueries } from '@/queries/listing.queries';

import { Details } from './Details';
import { Header } from './header';
import { MatchScore } from './MatchScore';
import { Timeline } from './timeline';

export function Applications() {
  const { listingId, applicationId } = useParams<{
    listingId: string;
    applicationId?: string;
  }>();
  const { data: listing } = useSuspenseQuery(listingsQueries.item(listingId!));

  return (
    <VStack align="stretch" gap="md" px="md" mb="md">
      <Header listing={listing} />
      <Details listing={listing} />
      <MatchScore applicationId={applicationId} />
      <Timeline applicationId={applicationId} />
    </VStack>
  );
}
