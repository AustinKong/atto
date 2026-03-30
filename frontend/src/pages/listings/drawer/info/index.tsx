import { List, Text, VStack } from '@chakra-ui/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { PiCheck } from 'react-icons/pi';
import { useParams } from 'react-router';

import { listingsQueries } from '@/queries/listing.queries';

import { Section } from '../Section';
import { About } from './About';
import { Header } from './Header';
import { KeywordAnalysis } from './KeywordAnalysis';

export function Info() {
  const { listingId } = useParams<{ listingId: string }>();
  const { data: listing } = useSuspenseQuery(listingsQueries.item(listingId!));

  return (
    <VStack px="md" gap="lg" align="stretch">
      <Header listing={listing} />

      <About listing={listing} />

      <Section title="Description">
        <Text>{listing.description}</Text>
      </Section>

      <Section title="Requirements">
        <List.Root variant="plain">
          {listing.requirements.map((req, index) => (
            <List.Item key={index}>
              <List.Indicator asChild color="green.fg">
                <PiCheck />
              </List.Indicator>
              <Text>{req}</Text>
            </List.Item>
          ))}
        </List.Root>
      </Section>

      <KeywordAnalysis listing={listing} />
    </VStack>
  );
}
