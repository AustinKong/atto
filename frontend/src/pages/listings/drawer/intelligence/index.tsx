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
import { LuCopy, LuRefreshCw } from 'react-icons/lu';
import { useParams } from 'react-router';

import { SegmentedGauge } from '@/components/custom/segmented-gauge';
import { SourceTooltip } from '@/components/custom/SourceTooltip';
import { nivoTheme } from '@/components/theme/nivo.theme';
import { useGenerateListingResearch, useUpdateListingNotes } from '@/mutations/listing.mutations';
import { listingsQueries } from '@/queries/listing.queries';

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
  const listingSalary = listing.salary;
  const marketSummary = research?.market.summary;

  const formatSalary = (value: number, currency: string) => {
    const symbol = currency === 'USD' ? '$' : currency + ' ';
    return `${symbol}${Math.round(value / 1000)}k`;
  };

  const filterTickValues = (values: number[]) => {
    const sorted = [...values].sort((a, b) => a - b);
    const range = sorted[sorted.length - 1] - sorted[0];
    const threshold = range * 0.08;
    const kept: number[] = [];
    for (const v of sorted) {
      if (kept.every((k) => Math.abs(k - v) >= threshold)) {
        kept.push(v);
      }
    }
    return kept;
  };
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
        <SegmentedGauge percent={sentiment?.value ?? 0} showPercentage height="6" />
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
        <VStack align="stretch" gap="1">
          <Heading size="sm">Salary Range</Heading>
          <VStack align="stretch" h="24">
            <ResponsiveBoxPlot
              animate={false}
              isInteractive={false}
              data={[
                { group: 'Industry', value: salary.industryMin, subgroup: 'min' },
                { group: 'Industry', value: salary.industryQ1, subgroup: 'q1' },
                { group: 'Industry', value: salary.industryMedian, subgroup: 'median' },
                { group: 'Industry', value: salary.industryQ3, subgroup: 'q3' },
                { group: 'Industry', value: salary.industryMax, subgroup: 'max' },
              ]}
              layout="horizontal"
              margin={{ top: 20, right: 10, bottom: 30, left: 10 }}
              axisBottom={{
                tickSize: 4,
                tickPadding: 4,
                tickRotation: 0,
                tickValues: filterTickValues([
                  salary.industryMin,
                  salary.industryQ1,
                  salary.industryMedian,
                  salary.industryQ3,
                  salary.industryMax,
                  ...(listingSalary ? [listingSalary.value] : []),
                ]),
                format: (v) => formatSalary(v as number, salary.currency),
              }}
              axisLeft={null}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              theme={nivoTheme as any}
              defaultHeight={100}
              markers={[
                {
                  axis: 'x',
                  value: salary.industryMedian,
                  lineStyle: { stroke: 'var(--chakra-colors-fg)', strokeWidth: 1.5 },
                  legend: 'Median',
                  legendPosition: 'top',
                  legendOrientation: 'horizontal',
                },
                ...(listingSalary
                  ? [
                      {
                        axis: 'x' as const,
                        value: listingSalary.value,
                        lineStyle: {
                          stroke: 'var(--chakra-colors-blue-400)',
                          strokeWidth: 2,
                          strokeDasharray: '4 3',
                        },
                        legend: 'Listed',
                        legendPosition: 'top' as const,
                        legendOrientation: 'horizontal' as const,
                      },
                    ]
                  : []),
              ]}
            />
          </VStack>
          <Text color="fg.muted" textStyle="xs">
            {listingSalary && (
              <>
                Listed salary:{' '}
                <Text as="span" fontWeight="medium" color="fg">
                  {formatSalary(listingSalary.value, listingSalary.currency)}
                </Text>
                {' · '}
              </>
            )}
            Industry range: {formatSalary(salary.industryMin, salary.currency)}–
            {formatSalary(salary.industryMax, salary.currency)} (median{' '}
            {formatSalary(salary.industryMedian, salary.currency)})
          </Text>
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
          <List.Root as="ol" gap="2" color="fg.muted" textStyle="sm">
            {applicantInsights.map((insight) => {
              return (
                <List.Item key={insight} ml="4">
                  {insight}
                </List.Item>
              );
            })}
          </List.Root>
        )}
      </VStack>

      {/* Metadata Footer */}
      <HStack w="full" justify="space-between">
        <Text textStyle="sm" color="fg.muted">
          {isResearching
            ? 'Generating...'
            : research
              ? // TODO: Use proper localization supported date display
                `Generated at ${new Date(research.generatedAt).toLocaleString()}`
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
