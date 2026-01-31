import { Splitter, VStack } from '@chakra-ui/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';
import { useParams } from 'react-router';

import { useWatchForm } from '@/hooks/useWatchForm';
import { useSaveResume } from '@/mutations/resume';
import { resumeQueries } from '@/queries/resume';
import type { ResumeData } from '@/types/resume';

import { Editor } from './editor';
import { Preview } from './preview';

// TODO: I will use this implementation for now. But I need to figure out a way to avoid double firing of updateResume
// It seems that using `values: { data: resume?.data }}` will trigger useWatchForm when values changes
export function ResumePage() {
  const { resumeId } = useParams<{ resumeId: string }>();
  const { data: resume } = useSuspenseQuery(resumeQueries.item(resumeId!));

  const methods = useForm<ResumeData>({
    defaultValues: resume.data,
  });

  const { mutate: saveResume } = useSaveResume();

  // This will cause the entire ResumePage component to re-render, remounting FormProvider. Which causes children who use useFormContext to also remount
  useWatchForm<ResumeData>((formData) => {
    saveResume({ resumeId: resumeId!, data: formData });
  }, methods.watch);

  return (
    <FormProvider {...methods}>
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
            <Preview resume={resume} />
          </Splitter.Panel>
        </Splitter.Root>
        <div>Footer</div>
      </VStack>
    </FormProvider>
  );
}
