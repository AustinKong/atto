import { Box } from '@chakra-ui/react';

import type { Profile } from '@/types/profile';
import type { Section } from '@/types/resume';

import { Document } from './Document';

export function ResumePreview({
  template,
  sections,
  profile,
}: {
  template: string;
  sections: Section[];
  profile: Profile;
}) {
  return (
    <Box h="full" w="full">
      <Document template={template} sections={sections} profile={profile} interactable={true} />
    </Box>
  );
}
