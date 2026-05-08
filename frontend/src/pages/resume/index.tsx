import { Splitter } from '@chakra-ui/react';
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

  return (
    <Splitter.Root
      panels={[
        { id: 'workspace', minSize: 20 },
        { id: 'preview', minSize: 20 },
      ]}
      defaultSize={[40, 60]}
    >
      <Splitter.Panel id="workspace">
        <Workspace applicationId={applicationId} listingId={listingId} />
      </Splitter.Panel>
      <Splitter.ResizeTrigger id="workspace:preview" />
      <Splitter.Panel id="preview">
        <Preview />
      </Splitter.Panel>
    </Splitter.Root>
  );
}
