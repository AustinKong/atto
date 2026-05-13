import { Text } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';

import { SegmentedGauge } from '@/components/custom/segmented-gauge';
import { applicationQueries } from '@/queries/application.queries';

import { Section } from '../Section';

export function MatchScore({ applicationId }: { applicationId?: string }) {
  const { data: application } = useQuery({
    ...applicationQueries.item(applicationId ?? ''),
    enabled: Boolean(applicationId),
  });
  const score = application?.analysis?.matchScore;
  const hasScore = typeof score === 'number';

  return (
    <Section title="Match Score">
      <SegmentedGauge percent={score ?? 0} showPercentage size="lg" />
      {!hasScore && (
        <Text color="fg.muted" textStyle="sm">
          {applicationId
            ? 'Analysis not generated yet.'
            : 'Select an application to view the match score.'}
        </Text>
      )}
    </Section>
  );
}
