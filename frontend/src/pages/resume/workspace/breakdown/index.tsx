import { VStack, Wrap } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';

import { ContentQualityChart } from '@/components/custom/content-quality-chart';
import { SkillsComparison } from '@/pages/resume/SkillsComparison';
import { applicationQueries } from '@/queries/application.queries';

import { AnalysisFooter } from './AnalysisFooter';
import { MatchScore } from './MatchScore';
import { Suggestions } from './Suggestions';

export function Breakdown({
  applicationId,
  onSuggestionHover,
}: {
  applicationId: string;
  onSuggestionHover: (suggestionId: string | null) => void;
}) {
  const hasApplicationId = applicationId.trim() !== '';
  const { data: application, refetch: refetchApplication } = useQuery({
    ...applicationQueries.item(applicationId),
    enabled: hasApplicationId,
  });

  return (
    <VStack align="stretch" gap="md" p="md" h="full" overflowY="auto">
      <MatchScore />

      <Wrap align="stretch" gap="md" minW="0">
        <SkillsComparison rows={application?.analysis?.skillsComparison ?? null} />
        <ContentQualityChart />
      </Wrap>

      <AnalysisFooter
        applicationId={applicationId}
        analysis={application?.analysis ?? null}
        refetchApplication={refetchApplication}
      />

      <Suggestions onSuggestionHover={onSuggestionHover} />
    </VStack>
  );
}
