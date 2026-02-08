import { Field, VStack } from '@chakra-ui/react';
import { memo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import type { Profile } from '@/types/profile';

import { ProfileSectionsEditor } from '../ProfileSectionsEditor';
import { PersonalInformation } from './PersonalInformation';

export const Editor = memo(function Editor({ profile }: { profile: Profile }) {
  const form = useForm<Profile>({
    defaultValues: profile,
  });

  return (
    <VStack h="full" align="stretch" overflowY="auto" overflowX="hidden" gap={6} p={4}>
      {/* Personal Information */}
      <PersonalInformation profile={profile} />

      {/* Sections Editor */}
      <FormProvider {...form}>
        <VStack gap={2} align="stretch">
          <Field.Root>
            <Field.Label>Base Sections</Field.Label>
          </Field.Root>
          <ProfileSectionsEditor />
        </VStack>
      </FormProvider>
    </VStack>
  );
});

Editor.displayName = 'Editor';
