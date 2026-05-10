import { Splitter } from '@chakra-ui/react';
import { useCallback, useRef } from 'react';
import { useParams } from 'react-router';

import { Preview, type PreviewHandle } from './preview';
import { Workspace } from './workspace';

export function ResumePage() {
  const { applicationId: applicationParam } = useParams<{
    applicationId?: string;
  }>();
  const urlParams = new URLSearchParams(window.location.search);
  const applicationId = applicationParam ?? urlParams.get('applicationId') ?? '';
  // TODO: Change to use aa context to expose Preview's imperative fns so all children of ResumePage can update the preview highglihts
  // This is temporary
  const previewRef = useRef<PreviewHandle>(null);

  const handleSuggestionHover = useCallback((suggestionId: string | null) => {
    previewRef.current?.highlightSuggestion(suggestionId);
  }, []);

  return (
    <Splitter.Root
      panels={[
        { id: 'workspace', minSize: 20 },
        { id: 'preview', minSize: 20 },
      ]}
      defaultSize={[40, 60]}
    >
      <Splitter.Panel id="workspace">
        <Workspace applicationId={applicationId} onSuggestionHover={handleSuggestionHover} />
      </Splitter.Panel>
      <Splitter.ResizeTrigger id="workspace:preview" />
      <Splitter.Panel id="preview">
        <Preview ref={previewRef} />
      </Splitter.Panel>
    </Splitter.Root>
  );
}
