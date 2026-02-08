import { Field, VStack } from '@chakra-ui/react';
import { memo, useCallback } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { SectionsEditor } from '@/components/shared/sections-editor';
import { useWatchForm } from '@/hooks/useWatchForm';
import { useUpdateProfile } from '@/mutations/profile';
import type { Profile } from '@/types/profile';
import type { Section } from '@/types/resume';

import { PersonalInformation } from './PersonalInformation';

export const Editor = memo(function Editor({ profile }: { profile: Profile }) {
  const form = useForm<Profile>({
    defaultValues: profile,
    mode: 'onChange',
  });

  const { mutate: updateProfile } = useUpdateProfile();
  const { watch, setValue } = form;

  useWatchForm<Profile>((value) => {
    updateProfile(value);
  }, watch);

  const handleSectionsChange = useCallback(
    // Because SectionsEditor is uncontrolled internally, managing it as a controlled component does not have too much performance impact
    (updatedSections: Section[]) => {
      setValue('baseSections', updatedSections);
    },
    [setValue]
  );

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
          <SectionsEditor defaultValues={profile.baseSections} onChange={handleSectionsChange} />
        </VStack>
      </VStack>
    </FormProvider>
  );
});

Editor.displayName = 'Editor';
