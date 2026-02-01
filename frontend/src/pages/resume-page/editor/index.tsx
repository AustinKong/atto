import { Tabs } from '@chakra-ui/react';
import { useState } from 'react';

import type { Resume } from '@/types/resume';

import { Generate } from './Generate';
import { JsonEditor } from './JsonEditor';
import { ResumeSectionsEditor } from './ResumeSectionsEditor';

export { Generate } from './Generate';
export { JsonEditor } from './JsonEditor';
export { ResumeSectionsEditor } from './ResumeSectionsEditor';

export function Editor({ resume }: { resume: Resume }) {
  const defaultTab = resume.data.sections.length === 0 ? 'generate' : 'visual';
  const [activeTab, setActiveTab] = useState(defaultTab);

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

      <Tabs.Content value="visual" overflowY="scroll" p="0" flex="1" overflowX="hidden">
        <ResumeSectionsEditor />
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
