import { Splitter } from '@chakra-ui/react';

import { Editor } from './editor';
import { Preview } from './preview';

export function ResumePage() {
  return (
    <Splitter.Root
      panels={[
        { id: 'editor', minSize: 30, maxSize: 70 },
        { id: 'preview', minSize: 30, maxSize: 70 },
      ]}
    >
      <Splitter.Panel id="editor">
        <Editor />
      </Splitter.Panel>
      <Splitter.ResizeTrigger id="editor:preview" />
      <Splitter.Panel id="preview">
        <Preview />
      </Splitter.Panel>
    </Splitter.Root>
  );
}
