import {
  Clipboard,
  Heading,
  HStack,
  IconButton,
  List,
  Spacer,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { ResponsiveBoxPlot } from '@nivo/boxplot';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { LuCopy, LuLightbulb, LuRefreshCw, LuTrendingUp, LuUsers, LuZap } from 'react-icons/lu';
import { useParams } from 'react-router';

import { SegmentedGauge } from '@/components/custom/segmented-gauge';
import { SourceTooltip } from '@/components/custom/SourceTooltip';
import { nivoTheme } from '@/components/theme/nivo.theme';
import { useGenerateListingResearch, useUpdateListingNotes } from '@/mutations/listing.mutations';
import { listingsQueries } from '@/queries/listing.queries';

const insightIcons = [LuZap, LuTrendingUp, LuUsers, LuLightbulb];

export function Intelligence() {
  const { listingId } = useParams<{ listingId: string }>();
  const { data: listing, refetch: refetchListing } = useSuspenseQuery(
    listingsQueries.item(listingId!)
  );
  const updateNotes = useUpdateListingNotes();
  const { mutate: generateResearch } = useGenerateListingResearch();
  const [notes, setNotes] = useState(listing.notes ?? '');

  const { data: statusData } = useQuery({
    ...listingsQueries.researchStatus(listingId!),
    refetchInterval: (query) => {
      const s = query.state.data?.status;
      return s === 'pending' || s === 'running' ? 2000 : false;
    },
  });

  const isResearching = statusData?.status === 'pending' || statusData?.status === 'running';
  const wasResearching = useRef(false);

  // Refetch listing when research transitions from pending → done
  useEffect(() => {
    if (wasResearching.current && !isResearching) {
      refetchListing();
    }
    wasResearching.current = isResearching;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isResearching]);

  const research = listing.research;
  const sentiment = research?.sentiment;
  const salary = research?.salary;
  const marketSummary = research?.market.summary;
  const applicantInsights = research?.applicantInsights?.insights ?? [];
  const sentimentSources = sentiment?.sources ?? [];

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    updateNotes({ listingId: listing.id, notes: newNotes || null });
  };

  const handleRefreshResearch = () => {
    // Fire-and-forget: UI loading is driven by the status endpoint polling
    generateResearch(listing.id);
  };

  return (
    <VStack px="4" gap="6" align="stretch" key={listing.id}>
      {/* Sentiment Analysis */}
      <VStack align="stretch" gap="3">
        <Heading size="sm">Sentiment Analysis</Heading>
        <SegmentedGauge
          percent={sentiment?.value ?? 0}
          tooltipLabel="Sentiment"
          showPercentage
          height="6"
        />
        <HStack gap="2">
          <Text color="fg.muted" textStyle="xs">
            {sentimentSources.length > 0
              ? `Sentiment collected from ${sentimentSources.length} sources`
              : 'No sentiment sources yet'}
          </Text>
          {sentimentSources.length > 0 && <SourceTooltip sources={sentimentSources} />}
        </HStack>
      </VStack>

      {/* Salary Range */}
      {salary ? (
        <VStack align="stretch" h="24">
          <Heading size="sm">Salary Range</Heading>
          <ResponsiveBoxPlot
            animate={false}
            data={[
              { group: 'Market Range', value: salary.min, subgroup: 'min' },
              { group: 'Market Range', value: salary.q1, subgroup: 'q1' },
              { group: 'Market Range', value: salary.median, subgroup: 'median' },
              { group: 'Market Range', value: salary.q3, subgroup: 'q3' },
              { group: 'Market Range', value: salary.max, subgroup: 'max' },
            ]}
            layout="horizontal"
            margin={{ top: 20, right: 10, bottom: 40, left: 10 }}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Salary (USD)',
              legendPosition: 'middle',
              legendOffset: 50,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            theme={nivoTheme as any}
            defaultHeight={100}
            markers={[
              {
                axis: 'x',
                value: salary.median,
                lineStyle: {
                  stroke: 'var(--chakra-colors-fg)',
                  strokeWidth: 2,
                },
                legend: 'Market Median',
                legendPosition: 'right',
                legendOrientation: 'horizontal',
              },
            ]}
          />
        </VStack>
      ) : null}

      {/* Company News & Competitive Landscape */}
      <VStack align="stretch" gap="3">
        <Heading size="sm">Recent News & Market Position</Heading>
        <Text color="fg.muted" textStyle="sm">
          {marketSummary ?? 'No market summary generated yet.'}
        </Text>
      </VStack>

      {/* Key Insights */}
      <VStack align="stretch" gap="3">
        <Heading size="sm">Key Insights for Applicants</Heading>
        {applicantInsights.length === 0 ? (
          <Text color="fg.muted" textStyle="sm">
            No applicant insights yet. Generate research to populate this section.
          </Text>
        ) : (
          <List.Root variant="plain" gap="2">
            {applicantInsights.map((insight, i) => {
              const IconComponent = insightIcons[i % insightIcons.length];
              return (
                <List.Item key={insight}>
                  <List.Indicator asChild color="blue">
                    <IconComponent size={18} />
                  </List.Indicator>
                  <Text color="fg.muted" textStyle="sm">
                    {insight}
                  </Text>
                </List.Item>
              );
            })}
          </List.Root>
        )}
      </VStack>

      {/* Metadata Footer */}
      <HStack w="full" justify="space-between">
        <Text textStyle="sm">
          {isResearching
            ? 'Generating...'
            : research
              ? 'Research ready'
              : 'Research not generated yet'}
        </Text>
        <Spacer />
        <Clipboard.Root value="Company intelligence data">
          <Clipboard.Trigger asChild>
            <IconButton aria-label="Copy" variant="ghost" size="xs" disabled={isResearching}>
              <LuCopy />
            </IconButton>
          </Clipboard.Trigger>
        </Clipboard.Root>
        <IconButton
          aria-label="Refresh"
          variant="ghost"
          size="xs"
          onClick={handleRefreshResearch}
          loading={isResearching}
        >
          <LuRefreshCw />
        </IconButton>
      </HStack>

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
