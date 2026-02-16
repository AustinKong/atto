import { Splitter, VStack } from '@chakra-ui/react';
import { useSuspenseQuery } from '@tanstack/react-query';

import { ReadonlyResumePreview } from '@/components/shared/resume-preview';
import { profileQueries } from '@/queries/profile';
import { settingsQueries } from '@/queries/settings';
import { templateQueries } from '@/queries/template';

import { Editor } from './editor';

export function ProfilePage() {
  const { data: profile } = useSuspenseQuery(profileQueries.item());
  const { data: settings } = useSuspenseQuery(settingsQueries.all());

  const templateId = String(settings.resume.fields.default_template.value);
  const { data: template } = useSuspenseQuery(templateQueries.item(templateId));

  // useDevelopmentOnly();

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
          <ReadonlyResumePreview
            template={template}
            sections={profile.baseSections}
            profile={profile}
          />
        </Splitter.Panel>
      </Splitter.Root>
      <div>Footer</div>
    </VStack>
  );
}
