import { Clipboard, HStack, IconButton, Spacer, Text } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { LuCopy, LuRefreshCw } from 'react-icons/lu';

import { FeatureTooltip } from '@/components/custom/feature-tooltip';
import { useGenerateListingResearch } from '@/mutations/listing.mutations';
import { listingsQueries } from '@/queries/listing.queries';
import type { ListingResearch } from '@/types/listing.types';
import type { TaskStatus } from '@/types/task-status.types';

const RESEARCH_POLLING_INTERVAL = 2000;

function buildClipboardText(research: ListingResearch | null): string {
  if (!research) return '';

  const lines: string[] = [];
  lines.push('Recent News & Market Position', research.market.summary, '');
  lines.push('Key Insights for Applicants');
  research.applicantInsights.insights.forEach((insight, i) => {
    lines.push(`${i + 1}. ${insight}`);
  });

  return lines.join('\n');
}

function isResearchInProgress(status: TaskStatus | undefined): boolean {
  return status === 'pending' || status === 'running';
}

export function ResearchFooter({
  listingId,
  research,
  refetchListing,
}: {
  listingId: string;
  research: ListingResearch | null;
  refetchListing: () => void;
}) {
  const { mutate: generateResearch } = useGenerateListingResearch();

  const { data: statusData } = useQuery({
    ...listingsQueries.researchStatus(listingId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return isResearchInProgress(status) ? RESEARCH_POLLING_INTERVAL : false;
    },
  });

  const isResearching = isResearchInProgress(statusData?.status);

  useEffect(() => {
    if (!isResearching) {
      refetchListing();
    }
  }, [isResearching, refetchListing]);

  return (
    <HStack w="full" justify="space-between" color="fg.muted">
      <Text>
        {isResearching
          ? 'Generating...'
          : research
            ? `Generated at ${new Date(research.generatedAt).toLocaleString()}`
            : 'Research not generated yet'}
      </Text>
      <Spacer />
      <FeatureTooltip hasCloud={false} hasApiKey={true} size="sm" />
      <Clipboard.Root value={buildClipboardText(research)}>
        <Clipboard.Trigger asChild>
          <IconButton aria-label="Copy" variant="ghost" size="xs" disabled={!research}>
            <LuCopy />
          </IconButton>
        </Clipboard.Trigger>
      </Clipboard.Root>
      <IconButton
        aria-label="Refresh"
        variant="ghost"
        size="xs"
        onClick={() => generateResearch(listingId)}
        loading={isResearching}
      >
        <LuRefreshCw />
      </IconButton>
    </HStack>
  );
}
