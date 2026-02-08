import { Field, VStack } from '@chakra-ui/react';
import { memo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { useWatchForm } from '@/hooks/useWatchForm';
import { useUpdateProfile } from '@/mutations/profile';
import type { Profile } from '@/types/profile';

import { ProfileSectionsEditor } from '../ProfileSectionsEditor';
import { PersonalInformation } from './PersonalInformation';

export const Editor = memo(function Editor({ profile }: { profile: Profile }) {
  const form = useForm<Profile>({
    defaultValues: profile,
    mode: 'onChange',
  });

  const { mutate: autosave } = useUpdateProfile();
  const { watch } = form;

  // Autosave all profile changes (personal info + base sections)
  useWatchForm<Profile>((value) => {
    autosave(value);
  }, watch);

  return (
    <FormProvider {...form}>
      <VStack h="full" align="stretch" overflowY="auto" overflowX="hidden" gap={6} p={4}>
        {/* Personal Information */}
        <PersonalInformation />

        {/* Sections Editor */}
        <VStack gap={2} align="stretch">
          <Field.Root>
            <Field.Label>Base Sections</Field.Label>
          </Field.Root>
          <ProfileSectionsEditor />
        </VStack>
      </VStack>
    </FormProvider>
  );
});

Editor.displayName = 'Editor';
