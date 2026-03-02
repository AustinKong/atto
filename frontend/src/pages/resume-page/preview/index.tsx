import { VStack } from '@chakra-ui/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';

import { ResumePreview } from '@/components/shared/resume-preview';
import { resumeQueries } from '@/queries/resume';
import { templateQueries } from '@/queries/template';

import { Toolbar } from './Toolbar';

export function Preview() {
  const { resumeId } = useParams<{ resumeId: string }>();
  const { data: resume } = useSuspenseQuery(resumeQueries.item(resumeId!));
  const { data: template } = useSuspenseQuery(templateQueries.localItem(resume.templateId));

  return (
    <VStack gap="0" h="full">
      <Toolbar resume={resume} template={template} />
      <ResumePreview template={template} sections={resume.sections} profile={resume.profile} />
    </VStack>
  );
}
