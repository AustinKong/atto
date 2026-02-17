import { Splitter, VStack } from '@chakra-ui/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';

import { ResumePreview } from '@/components/shared/resume-preview';
import { useDevelopmentOnly } from '@/hooks/useDevelopmentOnly';
import { profileQueries } from '@/queries/profile';
import { resumeQueries } from '@/queries/resume';
import { templateQueries } from '@/queries/template';

import { Editor } from './editor';
import { ResumeToolbar } from './Toolbar';

export function ResumePage() {
  const { resumeId } = useParams<{ resumeId: string }>();
  const { data: resume } = useSuspenseQuery(resumeQueries.item(resumeId!));
  const { data: profile } = useSuspenseQuery(profileQueries.item());
  const { data: template } = useSuspenseQuery(templateQueries.localItem(resume.templateId));

  useDevelopmentOnly();

  return (
    <VStack h="full" gap="0" alignItems="stretch">
      <ResumeToolbar />
      <Splitter.Root
        panels={[
          { id: 'editor', minSize: 30, maxSize: 70 },
          { id: 'preview', minSize: 30, maxSize: 70 },
        ]}
      >
        <Splitter.Panel id="editor">
          <Editor resume={resume} />
        </Splitter.Panel>
        <Splitter.ResizeTrigger id="editor:preview" />
        <Splitter.Panel id="preview">
          <ResumePreview template={template} sections={resume.sections} profile={profile} />
        </Splitter.Panel>
      </Splitter.Root>
      <div>Footer</div>
    </VStack>
  );
}
