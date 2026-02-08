import { Splitter, VStack } from '@chakra-ui/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';

import { ResumePreview } from '@/components/shared/resume-preview';
import { useDevelopmentOnly } from '@/hooks/useDevelopmentOnly';
import { resumeQueries } from '@/queries/resume';

import { Editor } from './editor';

export function ResumePage() {
  const { resumeId } = useParams<{ resumeId: string }>();
  const { data: resume } = useSuspenseQuery(resumeQueries.item(resumeId!));

  useDevelopmentOnly();

  return (
    <VStack h="full" gap="0" alignItems="stretch">
      <div>Toolbar</div>
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
          <ResumePreview template={resume.template} sections={resume.data.sections} />
        </Splitter.Panel>
      </Splitter.Root>
      <div>Footer</div>
    </VStack>
  );
}
