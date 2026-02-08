import { Field, Input, VStack } from '@chakra-ui/react';
import { memo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { useWatchForm } from '@/hooks/useWatchForm';
import { useUpdateProfile } from '@/mutations/profile';
import type { Profile } from '@/types/profile';

export const PersonalInformation = memo(function PersonalInformation({
  profile,
}: {
  profile: Profile;
}) {
  const form = useForm<Profile>({
    defaultValues: profile,
    mode: 'onChange',
  });

  const { mutate: autosave } = useUpdateProfile();
  const { watch } = form;

  // Autosave all personal information changes via useWatchForm (debounced by useUpdateProfile)
  useWatchForm<Profile>((value) => {
    autosave(value);
  }, watch);

  return (
    <FormProvider {...form}>
      <VStack gap={4} align="stretch">
        <Field.Root required>
          <Field.Label>
            Full Name
            <Field.RequiredIndicator />
          </Field.Label>
          <Input {...form.register('fullName', { required: true })} placeholder="Your full name" />
          <Field.HelperText>Your full legal name.</Field.HelperText>
        </Field.Root>

        <Field.Root required>
          <Field.Label>
            Email Address
            <Field.RequiredIndicator />
          </Field.Label>
          <Input
            {...form.register('email', { required: true })}
            type="email"
            placeholder="your.email@example.com"
          />
          <Field.HelperText>Your primary email address.</Field.HelperText>
        </Field.Root>

        <Field.Root>
          <Field.Label>Phone Number</Field.Label>
          <Input {...form.register('phone')} type="tel" placeholder="(123) 456-7890" />
          <Field.HelperText>Your primary phone number.</Field.HelperText>
        </Field.Root>

        <Field.Root>
          <Field.Label>Location</Field.Label>
          <Input {...form.register('location')} placeholder="City, Country" />
          <Field.HelperText>Your location.</Field.HelperText>
        </Field.Root>

        <Field.Root>
          <Field.Label>Website</Field.Label>
          <Input {...form.register('website')} type="url" placeholder="https://example.com" />
          <Field.HelperText>Your personal or professional website.</Field.HelperText>
        </Field.Root>
      </VStack>
    </FormProvider>
  );
});

PersonalInformation.displayName = 'PersonalInformation';
