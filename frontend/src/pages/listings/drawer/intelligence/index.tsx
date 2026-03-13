import {
  Box,
  Button,
  Circle,
  Heading,
  HStack,
  Marquee,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { LuSparkles } from 'react-icons/lu';
import { useParams } from 'react-router';

import { useGenerateListingInsights, useUpdateListingNotes } from '@/mutations/listing.mutations';
import { listingsQueries } from '@/queries/listing.queries';

const dummyNewsItems = [
  'React 19 introduces new hooks for better performance',
  'TypeScript 5.4 released with improved type inference',
  'Web Assembly capabilities expanded in major browsers',
  'Accessibility standards updated for 2024',
  'AI integration trends in modern development',
  'Cloud infrastructure cost optimization tips',
  'Security vulnerabilities found in popular packages',
];

export function Intelligence() {
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
      {/* News Ticker */}
      <VStack align="stretch" gap="2">
        <Heading size="md">Latest News</Heading>
        <HStack bg="bg.muted" borderRadius="md" overflow="hidden">
          <Box
            bg="teal.solid"
            color="teal.contrast"
            px="4"
            py="2"
            whiteSpace="nowrap"
            textStyle="sm"
            fontWeight="medium"
          >
            INDUSTRY
          </Box>

          <Marquee.Root pauseOnInteraction css={{ '--marquee-duration': '30s' }}>
            <Marquee.Viewport>
              <Marquee.Content textStyle="sm">
                {dummyNewsItems.map((item, i) => (
                  <Marquee.Item key={i} pr="4">
                    <HStack align="center" gap="8" fontWeight="medium">
                      {item}
                      <Circle size="1" bg="colorPalette.solid" />
                    </HStack>
                  </Marquee.Item>
                ))}
              </Marquee.Content>
            </Marquee.Viewport>
          </Marquee.Root>
        </HStack>
      </VStack>

      {/* AI Insights */}
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

      {/* Your Notes */}
      <VStack align="stretch" gap="2">
        <Heading size="md">Your Notes</Heading>
        <Textarea
          value={notes}
          onChange={handleNotesChange}
          placeholder="Add your research notes about this opportunity here..."
          autoresize
          rows={5}
        />
      </VStack>
    </VStack>
  );
}
