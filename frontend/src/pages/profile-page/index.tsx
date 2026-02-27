import { Splitter, VStack } from '@chakra-ui/react';
import { useSuspenseQuery } from '@tanstack/react-query';

import { ResumePreview } from '@/components/shared/resume-preview';
import { profileQueries } from '@/queries/profile';
import { templateQueries } from '@/queries/template';

import { Editor } from './editor';

export function ProfilePage() {
  const { data: profile } = useSuspenseQuery(profileQueries.item());
  const { data: defaultTemplate } = useSuspenseQuery(templateQueries.default());

  const { data: template } = useSuspenseQuery(
    templateQueries.localItem(defaultTemplate.template_id)
  );

  return (
    <VStack h="full" gap="0" alignItems="stretch">
      {/* Toolbar here */}
      <Splitter.Root
        panels={[
          { id: 'editor', minSize: 30, maxSize: 70 },
          { id: 'preview', minSize: 30, maxSize: 70 },
        ]}
      >
        <Splitter.Panel id="editor">
          <Editor profile={profile} />
        </Splitter.Panel>
        <Splitter.ResizeTrigger id="editor:preview" />
        <Splitter.Panel id="preview">
          <ResumePreview template={template} sections={profile.baseSections} profile={profile} />
        </Splitter.Panel>
      </Splitter.Root>
      {/* Footer here */}
    </VStack>
  );
}
