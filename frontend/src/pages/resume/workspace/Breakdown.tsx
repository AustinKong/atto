import { Box, Text, VStack } from '@chakra-ui/react';

import { ContentQualityChart } from '@/components/custom/content-quality-chart';
import { SegmentedGauge } from '@/components/custom/segmented-gauge';
import { SkillsComparison } from '@/pages/resume/SkillsComparison';

export function Breakdown({
  applicationId,
  listingId,
}: {
  applicationId: string;
  listingId: string;
}) {
  return (
    <VStack align="stretch" gap="md" p="md" h="full" overflowY="auto">
      <Box borderRadius="md" p="md">
        <VStack align="stretch" gap="xs">
          <Text textStyle="sm" color="fg.muted">
            Match Score
          </Text>
          <SegmentedGauge percent={Math.random()} />
        </VStack>
      </Box>

      <Box borderRadius="md" p="md" flex="1" minW="0" overflowY="auto">
        <VStack align="stretch" gap="xs" h="full">
          <Text textStyle="sm" color="fg.muted">
            Skills Radar
          </Text>
          <Box flex="1" minH="0">
            <SkillsComparison applicationId={applicationId} listingId={listingId} />
          </Box>
        </VStack>
      </Box>

      <Box borderRadius="md" p="md" flex="1" minW="0" overflowY="auto">
        <VStack align="stretch" gap="xs" h="full">
          <Text textStyle="sm" color="fg.muted">
            Content Quality
          </Text>
          <Box flex="1" minH="0">
            <ContentQualityChart />
          </Box>
        </VStack>
      </Box>
    </VStack>
  );
}
