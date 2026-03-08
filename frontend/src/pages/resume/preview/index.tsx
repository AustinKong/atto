import { VStack } from '@chakra-ui/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';

import { ResumePreview } from '@/components/custom/resume-preview';
import { profileQueries } from '@/queries/profile.queries';
import { resumeQueries } from '@/queries/resume.queries';
import { templateQueries } from '@/queries/template.queries';

import { Toolbar } from './Toolbar';

export function Preview() {
  const { resumeId } = useParams<{ resumeId: string }>();
  const { data: resume } = useSuspenseQuery(resumeQueries.item(resumeId!));
  const { data: template } = useSuspenseQuery(templateQueries.localItem(resume.templateId));
  const { data: profile } = useSuspenseQuery(profileQueries.list());

  return (
    <VStack gap="0" h="full">
      <Toolbar resume={resume} template={template} profile={profile} />
      <ResumePreview template={template} sections={resume.sections} profile={profile} />
    </VStack>
  );
}
