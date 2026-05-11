import { Tabs, VStack } from '@chakra-ui/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';

import { SectionsEditor } from '@/components/custom/sections-editor';
import { useSaveResumeSections } from '@/mutations/resume.mutations';
import { resumeQueries } from '@/queries/resume.queries';
import type { Section } from '@/types/resume.types';

import { Breakdown } from './breakdown';
import { Editor } from './editor';

// TODO: Create a Section component similar to Listing > Application for consistency
export function Workspace({
  applicationId,
}: {
  applicationId?: string;
}) {
  const { resumeId } = useParams<{ resumeId: string }>();
  const { data: resume } = useSuspenseQuery(resumeQueries.item(resumeId!));

  const { mutate: saveResume } = useSaveResumeSections();

  const handleSectionsChange = (sections: Section[]) => {
    saveResume({ resumeId: resume.id, sections });
  };

  return (
    <Tabs.Root defaultValue="editor">
      <Tabs.List h="10" alignItems="end">
        <Tabs.Trigger value="editor">Editor</Tabs.Trigger>
        <Tabs.Trigger value="breakdown" disabled={!applicationId}>
          Breakdown
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="editor" p="md" overflowX="hidden">
        <VStack align="stretch" gap="md">
          <Editor />
          <SectionsEditor defaultValues={resume.sections} onChange={handleSectionsChange} />
        </VStack>
      </Tabs.Content>

      {applicationId && (
        <Tabs.Content value="breakdown" p="0">
          <Breakdown applicationId={applicationId} resumeSections={resume.sections} />
        </Tabs.Content>
      )}
    </Tabs.Root>
  );
}
