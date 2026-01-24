import { Button, Heading, Text, Textarea, VStack } from '@chakra-ui/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { LuSparkles } from 'react-icons/lu';
import { useParams } from 'react-router';

import { useGenerateListingInsights, useUpdateListingNotes } from '@/mutations/listings';
import { listingsQueries } from '@/queries/listings';

export function Research() {
  const { listingId } = useParams<{ listingId: string }>();
  const { data: listing } = useSuspenseQuery(listingsQueries.item(listingId!));
  const updateNotes = useUpdateListingNotes();
  const { generateInsights, isGeneratingInsights } = useGenerateListingInsights();
  const [notes, setNotes] = useState(listing.notes ?? '');

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    updateNotes({ listingId: listing.id, notes: newNotes || null });
  };

  const handleGenerateInsights = () => {
    if (isGeneratingInsights) {
      return;
    }

    generateInsights(listing.id);
  };

  return (
    <VStack px="4" gap="4" align="stretch" key={listing.id}>
      <VStack align="stretch" gap="2">
        <Heading size="md">Your Notes</Heading>
        <Textarea
          value={notes}
          onChange={handleNotesChange}
          placeholder="Add your research notes about the company here..."
          autoresize
          rows={5}
        />
      </VStack>

      <VStack align="stretch" gap="2">
        <Heading size="md">AI Insights</Heading>
        {listing.insights ? (
          <Text whiteSpace="pre-wrap">{listing.insights}</Text>
        ) : (
          <Text color="fg.subtle" fontStyle="italic">
            No insights available yet.
          </Text>
        )}
        <Button
          onClick={handleGenerateInsights}
          loading={isGeneratingInsights}
          loadingText="Generating..."
          alignSelf="start"
          size="sm"
          w="full"
          variant="outline"
        >
          <LuSparkles />
          {listing.insights ? 'Regenerate Insights' : 'Generate Insights'}
        </Button>
        <Text textStyle="xs" color="fg.subtle">
          This feature is work in progress, insights generated may be of poor quality.
        </Text>
      </VStack>
    </VStack>
  );
}
