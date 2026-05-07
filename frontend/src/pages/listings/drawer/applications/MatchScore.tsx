import { HStack, Text } from '@chakra-ui/react';

import { SegmentedGauge } from '@/components/custom/segmented-gauge';

import { Section } from '../Section';

export function MatchScore({ applicationId }: { applicationId?: string }) {
  const isSelected = Boolean(applicationId);

  return (
    <Section title="Match Score">
      <SegmentedGauge percent={0} showPercentage size="lg" />
      <HStack gap="xs" color="fg.muted">
        <Text>
          {isSelected
            ? 'Unavailable until deterministic scoring is implemented.'
            : 'Select an application to view the match score.'}
        </Text>
      </HStack>
    </Section>
  );
}
