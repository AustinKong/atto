import { Heading, List, Text, VStack } from '@chakra-ui/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { PiCheck } from 'react-icons/pi';
import { useParams } from 'react-router';

import { listingsQueries } from '@/queries/listing.queries';

import { About } from './About';
import { Header } from './Header';
import { KeywordAnalysis } from './KeywordAnalysis';

export function Info() {
  const { listingId } = useParams<{ listingId: string }>();
  const { data: listing } = useSuspenseQuery(listingsQueries.item(listingId!));

  return (
    <VStack px="md" gap="md" align="stretch">
      <Header listing={listing} />

      <About listing={listing} />

      <VStack align="stretch">
        <Heading size="md">Description</Heading>
        <Text color="fg.muted">{listing.description}</Text>
      </VStack>

      <VStack align="stretch">
        <Heading size="md">Requirements</Heading>
        <List.Root variant="plain">
          {listing.requirements.map((req, index) => (
            <List.Item key={index}>
              <List.Indicator asChild color="green">
                <PiCheck />
              </List.Indicator>
              <Text color="fg.muted">{req}</Text>
            </List.Item>
          ))}
        </List.Root>
      </VStack>

      <KeywordAnalysis listing={listing} />
    </VStack>
  );
}
