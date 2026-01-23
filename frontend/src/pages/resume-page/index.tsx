import { Center, Splitter, VStack } from '@chakra-ui/react';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useParams } from 'react-router';

import { useResumeMutations, useResumeQuery } from '@/hooks/resumes';
import { useDebouncedMutation } from '@/hooks/utils/useDebouncedMutation';
import { useWatchForm } from '@/hooks/utils/useWatchForm';
import { updateResume } from '@/services/resume';
import type { ResumeData, ResumeFormData } from '@/types/resume';
import { queryClient } from '@/utils/queryClient';

import { Editor } from './editor';
import { Preview } from './preview';

// TODO: I will use this implementation for now. But I need to figure out a way to avoid double firing of updateResume
// It seems that using `values: { data: resume?.data }}` will trigger useWatchForm when values changes
export function ResumePage() {
  const { resumeId } = useParams<{ resumeId: string }>();
  const { resume, isLoading } = useResumeQuery(resumeId);

  // Initialize React Hook Form
  const methods = useForm<ResumeFormData>({
    defaultValues: {
      data: resume?.data || { sections: [] },
    },
  });

  const { mutate: saveResume } = useDebouncedMutation({
    mutationFn: async (resumeData: ResumeData) => {
      return updateResume(resumeId!, resumeData);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['resume', resumeId], data);
      // Do not need to reset() sync server state back to form state
      // Doing so causes many headaches
    },
  });

  useWatchForm<ResumeFormData>((formData) => {
    console.log('Form data changed:', formData.data);
    saveResume(formData.data);
  }, methods.watch);

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
