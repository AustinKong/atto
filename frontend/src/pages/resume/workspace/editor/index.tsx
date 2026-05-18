import { Collapsible, Field, Heading, HStack, Input, VStack } from '@chakra-ui/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';
import { LuChevronLeft } from 'react-icons/lu';
import { useParams } from 'react-router';

import { DEFAULT_RESUME_ID } from '@/constants/resume.constants';
import { useWatchForm } from '@/hooks/use-watch-form.hooks';
import { useSaveProfile } from '@/mutations/profile.mutations';
import { profileQueries } from '@/queries/profile.queries';
import type { Profile } from '@/types/profile.types';

export function Editor() {
  const { resumeId } = useParams<{ resumeId: string }>();
  const { data: profile } = useSuspenseQuery(profileQueries.list());

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
            cursor="pointer"
          >
            <Heading textStyle="title-sm">Basic Information</Heading>
            <Collapsible.Indicator
              color="fg.muted"
              transition="transform 0.2s"
              _open={{ transform: 'rotate(-90deg)' }}
            >
              <LuChevronLeft />
            </Collapsible.Indicator>
          </HStack>
        </Collapsible.Trigger>
        <Collapsible.Content asChild>
          <form autoComplete="off" spellCheck="false">
            <VStack gap={4} align="stretch" mt="md">
              <HStack>
                <Field.Root required>
                  <Field.Label textStyle="caption">
                    Full Name
                    <Field.RequiredIndicator />
                  </Field.Label>
                  <Input
                    {...form.register('fullName', { required: true })}
                    placeholder="Your full name"
                    disabled={!isDefault}
                  />
                  <Field.HelperText textStyle="caption">Your full legal name.</Field.HelperText>
                </Field.Root>

                <Field.Root required>
                  <Field.Label textStyle="caption">
                    Email Address
                    <Field.RequiredIndicator />
                  </Field.Label>
                  <Input
                    {...form.register('email', { required: true })}
                    type="email"
                    placeholder="your.email@example.com"
                    disabled={!isDefault}
                  />
                  <Field.HelperText textStyle="caption">
                    Your primary email address.
                  </Field.HelperText>
                </Field.Root>
              </HStack>

              <HStack>
                <Field.Root>
                  <Field.Label textStyle="caption">Phone Number</Field.Label>
                  <Input
                    {...form.register('phone')}
                    type="tel"
                    placeholder="(123) 456-7890"
                    disabled={!isDefault}
                  />
                  <Field.HelperText textStyle="caption">
                    Your primary phone number.
                  </Field.HelperText>
                </Field.Root>

                <Field.Root>
                  <Field.Label textStyle="caption">Location</Field.Label>
                  <Input
                    {...form.register('location')}
                    placeholder="City, Country"
                    disabled={!isDefault}
                  />
                  <Field.HelperText textStyle="caption">Your location.</Field.HelperText>
                </Field.Root>
              </HStack>

              <Field.Root>
                <Field.Label textStyle="caption">Website</Field.Label>
                <Input
                  {...form.register('website')}
                  type="url"
                  placeholder="https://example.com"
                  disabled={!isDefault}
                />
                {isDefault ? (
                  <Field.HelperText textStyle="caption">
                    Your personal or professional website.
                  </Field.HelperText>
                ) : (
                  <Field.HelperText textStyle="caption">
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
}
