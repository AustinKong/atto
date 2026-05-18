import { Heading, VStack } from '@chakra-ui/react';

import { SegmentedGauge } from '@/components/custom/segmented-gauge';
import type { ApplicationAnalysis } from '@/types/application.types';

const EMPTY_MATCH_SCORE = 0;

export function MatchScore({ analysis }: { analysis: ApplicationAnalysis | null }) {
  const score = analysis?.matchScore ?? EMPTY_MATCH_SCORE;

  return (
    <VStack align="stretch" gap="xs">
      <Heading textStyle="title-sm">Match Score</Heading>
      <SegmentedGauge percent={score} showPercentage size="lg" />
    </VStack>
  );
}
