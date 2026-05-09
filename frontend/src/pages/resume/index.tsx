import { Splitter } from '@chakra-ui/react';
import { useState } from 'react';
import { useParams } from 'react-router';

import { Preview } from './preview';
import { Workspace } from './workspace';

export function ResumePage() {
  const { listingId: listingParam, applicationId: applicationParam } = useParams<{
    listingId?: string;
    applicationId?: string;
  }>();
  const urlParams = new URLSearchParams(window.location.search);
  const listingId = listingParam ?? urlParams.get('listingId') ?? '';
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
        <Workspace
          applicationId={applicationId}
          listingId={listingId}
          onSuggestionHover={setHoveredSuggestionId}
        />
      </Splitter.Panel>
      <Splitter.ResizeTrigger id="workspace:preview" />
      <Splitter.Panel id="preview">
        <Preview highlightedSuggestionId={hoveredSuggestionId} />
      </Splitter.Panel>
    </Splitter.Root>
  );
}
