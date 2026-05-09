import { Text, VStack } from '@chakra-ui/react';

import { SegmentedGauge } from '@/components/custom/segmented-gauge';

export function MatchScore() {
  return (
    <VStack align="stretch" gap="xs">
      <Text textStyle="sm" color="fg.muted">
        Match Score
      </Text>
      <SegmentedGauge percent={0} showPercentage size="lg" />
    </VStack>
  );
}
