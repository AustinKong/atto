import { Center } from '@chakra-ui/react';

import type { Profile } from '@/types/profile';
import type { Section } from '@/types/resume';
import type { Template } from '@/types/template';

import { Document } from './Document';

export function ResumePreview({
  template,
  sections,
  profile,
}: {
  template: Template;
  sections: Section[];
  profile: Profile;
}) {
  return (
    <Center h="full" w="full" bgColor="gray.300" _dark={{ bgColor: 'gray.700' }}>
      <Document template={template} sections={sections} profile={profile} interactable={true} />
    </Center>
  );
}
