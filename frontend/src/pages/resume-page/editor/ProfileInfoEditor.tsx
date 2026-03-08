import { Collapsible, Field, HStack, Input, Text, VStack } from '@chakra-ui/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { memo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { LuChevronLeft } from 'react-icons/lu';
import { useParams } from 'react-router';

import { DEFAULT_RESUME_ID } from '@/constants/resume';
import { useWatchForm } from '@/hooks/useWatchForm';
import { useSaveProfile } from '@/mutations/profile';
import { profileQueries } from '@/queries/profile';
import type { Profile } from '@/types/profile';

export const ProfileEditor = memo(function ProfileEditor() {
  const { resumeId } = useParams<{ resumeId: string }>();
  const { data: profile } = useSuspenseQuery(profileQueries.item());

  const isDefault = resumeId === DEFAULT_RESUME_ID;

  const form = useForm<Profile>({
    defaultValues: profile,
    mode: 'onChange',
  });

  const { mutate: saveProfile } = useSaveProfile();
  const { watch } = form;

  useWatchForm<Profile>((value) => {
    if (isDefault) {
      saveProfile(value);
    }
  }, watch);

  return (
    <Collapsible.Root defaultOpen>
      <FormProvider {...form}>
        <Collapsible.Trigger asChild>
          <HStack
            alignItems="center"
            justifyContent="space-between"
            color="fg.muted"
            cursor="pointer"
          >
            <Text>Basic Information</Text>
            <Collapsible.Indicator
              transition="transform 0.2s"
              _open={{ transform: 'rotate(-90deg)' }}
            >
              <LuChevronLeft />
            </Collapsible.Indicator>
          </HStack>
        </Collapsible.Trigger>
        <Collapsible.Content asChild>
          <form autoComplete="off" spellCheck="false">
            <VStack gap={4} align="stretch" mt="4">
              <HStack>
                <Field.Root required>
                  <Field.Label>
                    Full Name
                    <Field.RequiredIndicator />
                  </Field.Label>
                  <Input
                    {...form.register('fullName', { required: true })}
                    placeholder="Your full name"
                    disabled={!isDefault}
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
                    disabled={!isDefault}
                  />
                  <Field.HelperText>Your primary email address.</Field.HelperText>
                </Field.Root>
              </HStack>

              <HStack>
                <Field.Root>
                  <Field.Label>Phone Number</Field.Label>
                  <Input
                    {...form.register('phone')}
                    type="tel"
                    placeholder="(123) 456-7890"
                    disabled={!isDefault}
                  />
                  <Field.HelperText>Your primary phone number.</Field.HelperText>
                </Field.Root>

                <Field.Root>
                  <Field.Label>Location</Field.Label>
                  <Input
                    {...form.register('location')}
                    placeholder="City, Country"
                    disabled={!isDefault}
                  />
                  <Field.HelperText>Your location.</Field.HelperText>
                </Field.Root>
              </HStack>

              <Field.Root>
                <Field.Label>Website</Field.Label>
                <Input
                  {...form.register('website')}
                  type="url"
                  placeholder="https://example.com"
                  disabled={!isDefault}
                />
                {isDefault ? (
                  <Field.HelperText>Your personal or professional website.</Field.HelperText>
                ) : (
                  <Field.HelperText color="fg.muted">
                    Profile can only be edited from the default resume.
                  </Field.HelperText>
                )}
              </Field.Root>
            </VStack>
          </form>
        </Collapsible.Content>
      </FormProvider>
    </Collapsible.Root>
  );
});

ProfileEditor.displayName = 'ProfileEditor';
