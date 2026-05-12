import { VStack, Wrap } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { RESUME_HIGHLIGHT_LAYERS } from '@/pages/resume/highlight-layers.constants';
import { useResumeHighlight } from '@/pages/resume/highlightContext';
import { applicationQueries } from '@/queries/application.queries';
import type { Section } from '@/types/resume.types';

import { AnalysisFooter } from './AnalysisFooter';
import { ContentQuality } from './ContentQuality';
import { MatchScore } from './MatchScore';
import { SkillsComparison } from './SkillsComparison';
import { Suggestions } from './Suggestions';

export function Breakdown({
  applicationId,
  resumeSections,
}: {
  applicationId: string;
  resumeSections: Section[];
}) {
  const { clear } = useResumeHighlight();
  const { data: application, refetch: refetchApplication } = useQuery({
    ...applicationQueries.item(applicationId),
  });
  const analysis = application?.analysis ?? null;
  const resumeHashKey = application?.analysis?.resumeHash ?? 'no-analysis';

  useEffect(
    () => () => {
      clear(RESUME_HIGHLIGHT_LAYERS.contentQuality);
      clear(RESUME_HIGHLIGHT_LAYERS.suggestions);
    },
    [clear]
  );

  return (
    <VStack align="stretch" gap="md" p="md" h="full" overflowY="auto">
      <MatchScore analysis={analysis} />

      <Wrap align="stretch" gap="md" minW="0">
        <SkillsComparison key={`skills-${resumeHashKey}`} rows={analysis?.skillsComparison ?? null} />
        <ContentQuality
          key={`content-quality-${resumeHashKey}`}
          contentQuality={analysis?.contentQuality ?? null}
          resumeSections={resumeSections}
        />
      </Wrap>

      <AnalysisFooter
        applicationId={applicationId}
        analysis={analysis}
        refetchApplication={refetchApplication}
      />

      <Suggestions aiSuggestions={analysis?.aiSuggestions ?? null} />
    </VStack>
  );
}
