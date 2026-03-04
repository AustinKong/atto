import { Field, HStack, Input, VStack } from '@chakra-ui/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { memo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useParams } from 'react-router';

import { useWatchForm } from '@/hooks/useWatchForm';
import { useSaveResumeProfile } from '@/mutations/resume';
import { resumeQueries } from '@/queries/resume';
import type { Profile } from '@/types/resume';

export const ProfileEditor = memo(function ProfileEditor() {
  const { resumeId } = useParams<{ resumeId: string }>();
  const { data: resume } = useSuspenseQuery(resumeQueries.item(resumeId!));

  const form = useForm<Profile>({
    defaultValues: resume.profile,
    mode: 'onChange',
  });

  const { mutate: saveProfile } = useSaveResumeProfile();
  const { watch } = form;

  useWatchForm<Profile>((value) => {
    saveProfile({ resumeId: resume.id, profile: value });
  }, watch);

  return (
    <FormProvider {...form}>
      <VStack h="full" align="stretch" overflowY="auto" gap={6} p={2} asChild>
        <form autoComplete="off" spellCheck="false">
          <VStack gap={4} align="stretch">
            <HStack>
              <Field.Root required>
                <Field.Label>
                  Full Name
                  <Field.RequiredIndicator />
                </Field.Label>
                <Input
                  {...form.register('fullName', { required: true })}
                  placeholder="Your full name"
                />
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
            </HStack>

            <HStack>
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
            </HStack>

            <Field.Root>
              <Field.Label>Website</Field.Label>
              <Input {...form.register('website')} type="url" placeholder="https://example.com" />
              <Field.HelperText>Your personal or professional website.</Field.HelperText>
            </Field.Root>
          </VStack>
        </form>
      </VStack>
    </FormProvider>
  );
});

ProfileEditor.displayName = 'ProfileEditor';
