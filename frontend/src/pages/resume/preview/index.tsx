import { VStack } from '@chakra-ui/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { type ForwardedRef, forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { useParams } from 'react-router';

import { ResumePreview, type ResumePreviewHandle } from '@/components/custom/resume-preview';
import { profileQueries } from '@/queries/profile.queries';
import { resumeQueries } from '@/queries/resume.queries';
import { templateQueries } from '@/queries/template.queries';
import type { Section } from '@/types/resume.types';

import { Toolbar } from './Toolbar';

export type PreviewHandle = {
  highlightSuggestion: (suggestionId: string | null) => void;
  clearHighlights: () => void;
};

export const Preview = forwardRef(function Preview(
  _props: object,
  ref: ForwardedRef<PreviewHandle>
) {
  const { resumeId } = useParams<{ resumeId: string }>();
  const { data: resume } = useSuspenseQuery(resumeQueries.item(resumeId!));
  const { data: template } = useSuspenseQuery(templateQueries.localItem(resume.templateId));
  const { data: profile } = useSuspenseQuery(profileQueries.list());
  const resumePreviewRef = useRef<ResumePreviewHandle>(null);
  const suggestionUnitIds = useMemo(() => getSuggestionUnitIds(resume.sections), [resume.sections]);

  useImperativeHandle(
    ref,
    () => ({
      highlightSuggestion: (suggestionId) => {
        const highlightedUnitIds =
          suggestionId === null ? [] : (suggestionUnitIds[suggestionId] ?? []);
        resumePreviewRef.current?.highlight(highlightedUnitIds);
      },
      clearHighlights: () => {
        resumePreviewRef.current?.clear();
      },
    }),
    [suggestionUnitIds]
  );

  return (
    <VStack gap="0" h="full">
      <Toolbar resume={resume} template={template} profile={profile} />
      <ResumePreview ref={resumePreviewRef} template={template} sections={resume.sections} profile={profile} />
    </VStack>
  );
});

function getSuggestionUnitIds(sections: Section[]): Record<string, string[]> {
  const experienceSection = sections.find(
    (section) => section.type === 'detailed' && section.title.content.toLowerCase() === 'experience'
  );
  const skillsSection = sections.find(
    (section) => section.type === 'simple' && section.title.content.toLowerCase() === 'skills'
  );

  if (!experienceSection || experienceSection.type !== 'detailed') {
    return {};
  }

  const firstExperience = experienceSection.content[0];
  const firstBulletId = firstExperience?.bullets[0]?.id;
  const secondBulletId = firstExperience?.bullets[1]?.id;
  const firstSkillId =
    skillsSection && skillsSection.type === 'simple' ? skillsSection.content[0]?.id : undefined;

  return {
    'exp-microservices': firstBulletId ? [firstBulletId] : [],
    'exp-kafka': secondBulletId ? [secondBulletId] : [],
    'skills-frontend': firstSkillId ? [firstSkillId] : [],
  };
}
