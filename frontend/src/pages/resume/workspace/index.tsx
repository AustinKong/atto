import { Tabs, VStack } from '@chakra-ui/react';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useRef } from 'react';
import { useParams } from 'react-router';

import { SectionsEditor, type SectionsEditorHandle } from '@/components/custom/sections-editor';
import { useSaveResumeSections } from '@/mutations/resume.mutations';
import { resumeQueries } from '@/queries/resume.queries';
import type { Section } from '@/types/resume.types';
import { replaceTextUnitContentById } from '@/utils/resume.utils';

import { Breakdown } from './breakdown';
import { Editor } from './editor';

// TODO: Create a Section component similar to Listing > Application for consistency
export function Workspace({ applicationId }: { applicationId?: string }) {
  const { resumeId } = useParams<{ resumeId: string }>();
  const { data: resume } = useSuspenseQuery(resumeQueries.item(resumeId!));
  const queryClient = useQueryClient();
  const sectionsEditorRef = useRef<SectionsEditorHandle>(null);

  const { mutate: saveResume } = useSaveResumeSections();

  const handleSectionsChange = (sections: Section[]) => {
    saveResume({ resumeId: resume.id, sections });
  };

  // TODO: Accepting suggestion -> repaint is a bit slow, see if we can eagerly update instead
  function handleAcceptSuggestion(unitId: string, replacementText: string): void {
    const { sections: updatedSections, updated } = replaceTextUnitContentById(
      resume.sections,
      unitId,
      replacementText
    );
    if (!updated) {
      return;
    }

    sectionsEditorRef.current?.reset(updatedSections);
    queryClient.setQueryData(resumeQueries.item(resume.id).queryKey, {
      ...resume,
      sections: updatedSections,
    });
    saveResume({ resumeId: resume.id, sections: updatedSections });
  }

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
          <SectionsEditor
            ref={sectionsEditorRef}
            defaultValues={resume.sections}
            onChange={handleSectionsChange}
          />
        </VStack>
      </Tabs.Content>

      {applicationId && (
        <Tabs.Content value="breakdown" p="0">
          <Breakdown
            applicationId={applicationId}
            resume={resume}
            resumeSections={resume.sections}
            onAcceptSuggestion={handleAcceptSuggestion}
          />
        </Tabs.Content>
      )}
    </Tabs.Root>
  );
}
