import { Tabs, VStack } from '@chakra-ui/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useRef } from 'react';
import { useParams } from 'react-router';

import type { SectionsEditorHandle } from '@/components/shared/sections-editor';
import { SectionsEditor } from '@/components/shared/sections-editor';
import { useSaveResumeSections } from '@/mutations/resume';
import { resumeQueries } from '@/queries/resume';
import type { Section } from '@/types/resume';

import { JsonEditor } from './JsonEditor';
import { ProfileEditor } from './ProfileInfoEditor';

export function Editor() {
  const { resumeId } = useParams<{ resumeId: string }>();
  const { data: resume } = useSuspenseQuery(resumeQueries.item(resumeId!));

  const { mutate: saveResume } = useSaveResumeSections();
  const sectionsEditorRef = useRef<SectionsEditorHandle | null>(null);

  const handleSectionsChange = (sections: Section[]) => {
    saveResume({ resumeId: resume.id, sections });
  };

  return (
    <Tabs.Root h="full" display="flex" flexDirection="column" defaultValue="visual">
      <Tabs.List h="10" alignItems="end">
        <Tabs.Trigger value="visual">Visual Editor</Tabs.Trigger>
        <Tabs.Trigger value="json">JSON Editor</Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="visual" overflowY="scroll" p="4" flex="1" overflowX="hidden">
        <VStack align="stretch" gap="4">
          <ProfileEditor />
          <SectionsEditor
            ref={sectionsEditorRef}
            defaultValues={resume.sections}
            onChange={handleSectionsChange}
          />
        </VStack>
      </Tabs.Content>

      <Tabs.Content value="json" overflowY="scroll" p="0" flex="1">
        <JsonEditor />
      </Tabs.Content>
    </Tabs.Root>
  );
}
