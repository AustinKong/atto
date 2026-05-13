import { VStack, Wrap } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { RESUME_HIGHLIGHT_LAYERS } from '@/pages/resume/highlight-layers.constants';
import { useResumeHighlight } from '@/pages/resume/highlightContext';
import { applicationQueries } from '@/queries/application.queries';
import type { Resume } from '@/types/resume.types';
import type { Section } from '@/types/resume.types';
import { hashResume, hashUnitContent } from '@/utils/hash.utils';
import { extractSectionTextUnits } from '@/utils/resume.utils';

import { AnalysisFooter } from './AnalysisFooter';
import { ContentQuality } from './ContentQuality';
import { MatchScore } from './MatchScore';
import { SkillsComparison } from './SkillsComparison';
import { Suggestions } from './Suggestions';

export function Breakdown({
  applicationId,
  resume,
  resumeSections,
  onAcceptSuggestion,
}: {
  applicationId: string;
  resume: Resume;
  resumeSections: Section[];
  onAcceptSuggestion: (unitId: string, replacementText: string) => void;
}) {
  const { clear } = useResumeHighlight();
  const [currentResumeHash, setCurrentResumeHash] = useState<string | null>(null);
  const [unitHashesById, setUnitHashesById] = useState<Record<string, string>>({});
  const { data: application, refetch: refetchApplication } = useQuery({
    ...applicationQueries.item(applicationId),
  });
  const analysis = application?.analysis ?? null;
  const resumeHashKey = application?.analysis?.resumeHash ?? 'no-analysis';
  const isSkillsComparisonOutdated = Boolean(
    analysis?.resumeHash && currentResumeHash && analysis.resumeHash !== currentResumeHash
  );

  useEffect(() => {
    let cancelled = false;

    async function computeHashes() {
      const [resumeHash, unitHashes] = await Promise.all([
        hashResume(resume),
        Promise.all(
          extractSectionTextUnits(resume.sections).map(async (unit) => ({
            unitId: unit.id,
            unitHash: await hashUnitContent(unit.content),
          }))
        ),
      ]);
      if (cancelled) {
        return;
      }

      setCurrentResumeHash(resumeHash);
      setUnitHashesById(Object.fromEntries(unitHashes.map((entry) => [entry.unitId, entry.unitHash])));
    }

    void computeHashes();

    return () => {
      cancelled = true;
    };
  }, [resume]);

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
        <SkillsComparison
          key={`skills-${resumeHashKey}`}
          rows={analysis?.skillsComparison ?? null}
          isOutdated={isSkillsComparisonOutdated}
        />
        <ContentQuality
          key={`content-quality-${resumeHashKey}`}
          contentQuality={analysis?.contentQuality ?? null}
          resumeSections={resumeSections}
          unitHashesById={unitHashesById}
        />
      </Wrap>

      <AnalysisFooter
        applicationId={applicationId}
        analysis={analysis}
        refetchApplication={refetchApplication}
      />

      <Suggestions
        key={`suggestions-${resumeHashKey}`}
        applicationId={applicationId}
        aiSuggestions={analysis?.aiSuggestions ?? null}
        onAcceptSuggestion={onAcceptSuggestion}
        unitHashesById={unitHashesById}
      />
    </VStack>
  );
}
