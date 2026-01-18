import { Center, Splitter, VStack } from '@chakra-ui/react';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useParams } from 'react-router';

import { useResumeMutations, useResumeQuery } from '@/hooks/resumes';
import type { ResumeFormData } from '@/types/resume';

import { Editor } from './editor';
import { Preview } from './preview';

export function ResumePage() {
  const { resumeId } = useParams<{ resumeId: string }>();
  const { resume, isLoading } = useResumeQuery(resumeId);

  // Initialize React Hook Form
  const methods = useForm<ResumeFormData>({
    defaultValues: {
      data: resume?.data || { sections: [] },
    },
  });

  // Watch for form changes - watch specific field to avoid unnecessary rerenders
  const resumeData = methods.watch('data');

  // Sync form data with resume when it changes externally
  useEffect(() => {
    if (resume) {
      methods.reset({ data: resume.data });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resume?.id]); // Only reset when resume ID changes

  // Get mutations (autosave 1000ms)
  const { saveResume } = useResumeMutations();

  // Auto-save on form changes (1000ms debounce)
  useEffect(() => {
    if (resume) {
      saveResume({ resumeId: resume.id, data: resumeData });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeData, resume?.id]); // Only depend on data and resume ID, not the whole resume object

  if (isLoading) {
    return <Center>Loading...</Center>;
  }

  if (!resume) {
    return <Center>No resume found.</Center>;
  }

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
