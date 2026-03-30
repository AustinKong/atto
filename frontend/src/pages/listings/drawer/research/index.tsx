import { VStack } from '@chakra-ui/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';

import { listingsQueries } from '@/queries/listing.queries';

import { ApplicantInsights } from './ApplicantInsights';
import { MarketSummary } from './MarketSummary';
import { Notes } from './Notes';
import { ResearchFooter } from './ResearchFooter';
import { SalaryRange } from './SalaryRange';
import { SentimentAnalysis } from './SentimentAnalysis';

export function Intelligence() {
  const { listingId } = useParams<{ listingId: string }>();
  const { data: listing, refetch: refetchListing } = useSuspenseQuery(
    listingsQueries.item(listingId!)
  );

  const research = listing.research;

  return (
    <VStack px="md" gap="lg" align="stretch" key={listing.id}>
      <SentimentAnalysis sentiment={research?.sentiment} />

      {research?.salary && <SalaryRange salary={research.salary} listingSalary={listing.salary} />}

      <MarketSummary summary={research?.market.summary} />

      <ApplicantInsights insights={research?.applicantInsights.insights ?? []} />

      <ResearchFooter listingId={listing.id} research={research} refetchListing={refetchListing} />

      <Notes listingId={listing.id} initialNotes={listing.notes} />
    </VStack>
  );
}
