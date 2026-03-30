import { HStack, Text } from '@chakra-ui/react';

import { SegmentedGauge } from '@/components/custom/segmented-gauge';
import { SourceTooltip } from '@/components/custom/source-tooltip';
import type { ListingResearch } from '@/types/listing.types';

import { Section } from '../Section';

export function SentimentAnalysis({
  sentiment,
}: {
  sentiment: ListingResearch['sentiment'] | undefined;
}) {
  const sources = sentiment?.sources ?? [];

  return (
    <Section title="Sentiment Analysis">
      <SegmentedGauge percent={sentiment?.value ?? 0} showPercentage size="lg" />
      <HStack gap="xs" color="fg.muted">
        <Text>
          {sources.length > 0
            ? `Sentiment collected from ${sources.length} sources`
            : 'No sentiment sources yet'}
        </Text>
        {sources.length > 0 && <SourceTooltip sources={sources} size="2xs" />}
      </HStack>
    </Section>
  );
}
