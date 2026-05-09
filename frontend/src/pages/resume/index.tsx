import { Splitter } from '@chakra-ui/react';
import { useState } from 'react';
import { useParams } from 'react-router';

import { Preview } from './preview';
import { Workspace } from './workspace';

export function ResumePage() {
  const { applicationId: applicationParam } = useParams<{
    applicationId?: string;
  }>();
  const urlParams = new URLSearchParams(window.location.search);
  const applicationId = applicationParam ?? urlParams.get('applicationId') ?? '';
  const [hoveredSuggestionId, setHoveredSuggestionId] = useState<string | null>(null);

  return (
    <Splitter.Root
      panels={[
        { id: 'workspace', minSize: 20 },
        { id: 'preview', minSize: 20 },
      ]}
      defaultSize={[40, 60]}
    >
      <Splitter.Panel id="workspace">
        <Workspace applicationId={applicationId} onSuggestionHover={setHoveredSuggestionId} />
      </Splitter.Panel>
      <Splitter.ResizeTrigger id="workspace:preview" />
      <Splitter.Panel id="preview">
        <Preview highlightedSuggestionId={hoveredSuggestionId} />
      </Splitter.Panel>
    </Splitter.Root>
  );
}
