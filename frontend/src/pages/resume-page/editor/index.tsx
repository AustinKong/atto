import { Tabs } from '@chakra-ui/react';
import { useState } from 'react';

import { SectionsEditor } from '@/components/shared/sections-editor';
import { useSaveResume } from '@/mutations/resume';
import type { Resume, Section } from '@/types/resume';

import { Generate } from './Generate';
import { JsonEditor } from './JsonEditor';

export { Generate } from './Generate';
export { JsonEditor } from './JsonEditor';

export function Editor({ resume }: { resume: Resume }) {
  const defaultTab = resume.sections.length === 0 ? 'generate' : 'visual';
  const [activeTab, setActiveTab] = useState(defaultTab);
  const { mutate: saveResume } = useSaveResume();

  const handleSectionsChange = (sections: Section[]) => {
    saveResume({
      resumeId: resume.id,
      sections,
    });
  };

  return (
    <Tabs.Root
      value={activeTab}
      onValueChange={(e) => setActiveTab(e.value)}
      h="full"
      display="flex"
      flexDirection="column"
    >
      <Tabs.List>
        <Tabs.Trigger value="visual">Visual Editor</Tabs.Trigger>
        <Tabs.Trigger value="json">JSON Editor</Tabs.Trigger>
        <Tabs.Trigger value="generate">Generate</Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="visual" overflowY="scroll" p="4" flex="1" overflowX="hidden">
        <SectionsEditor defaultValues={resume.sections} onChange={handleSectionsChange} />
      </Tabs.Content>

      <Tabs.Content value="json" overflowY="scroll" p="0" flex="1">
        <JsonEditor />
      </Tabs.Content>

      <Tabs.Content value="generate" flex="1" overflowY="auto" p="0" h="full">
        <Generate />
      </Tabs.Content>
    </Tabs.Root>
  );
}
