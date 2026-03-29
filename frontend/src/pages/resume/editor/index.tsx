import { Tabs, VStack } from '@chakra-ui/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useRef } from 'react';
import { useParams } from 'react-router';

import type { SectionsEditorHandle } from '@/components/custom/sections-editor';
import { SectionsEditor } from '@/components/custom/sections-editor';
import { useSaveResumeSections } from '@/mutations/resume.mutations';
import { resumeQueries } from '@/queries/resume.queries';
import type { Section } from '@/types/resume.types';

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
    <Tabs.Root defaultValue="visual">
      <Tabs.List h="10" alignItems="end">
        <Tabs.Trigger value="visual">Visual Editor</Tabs.Trigger>
        <Tabs.Trigger value="json">JSON Editor</Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="visual" p="md" overflowX="hidden">
        <VStack align="stretch" gap="md">
          <ProfileEditor />
          <SectionsEditor
            ref={sectionsEditorRef}
            defaultValues={resume.sections}
            onChange={handleSectionsChange}
          />
        </VStack>
      </Tabs.Content>

      <Tabs.Content value="json" p="0">
        <JsonEditor />
      </Tabs.Content>
    </Tabs.Root>
  );
}
