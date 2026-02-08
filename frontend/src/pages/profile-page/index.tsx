import { Splitter, VStack } from '@chakra-ui/react';
import { useSuspenseQuery } from '@tanstack/react-query';

import { ResumePreview } from '@/components/shared/resume-preview';
import { useDevelopmentOnly } from '@/hooks/useDevelopmentOnly';
import { profileQueries } from '@/queries/profile';
import { settingsQueries } from '@/queries/settings';

import { Editor } from './editor';

export function ProfilePage() {
  const { data: profile } = useSuspenseQuery(profileQueries.item());
  const { data: settings } = useSuspenseQuery(settingsQueries.all());

  const template = String(settings.resume.fields.default_template.value);

  useDevelopmentOnly();

  return (
    <VStack h="full" gap="0" alignItems="stretch">
      <div>Toolbar</div>
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
      <div>Footer</div>
    </VStack>
  );
}
