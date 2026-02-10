import { Field, HStack, Input, VStack } from '@chakra-ui/react';
import { memo } from 'react';
import { useFormContext } from 'react-hook-form';

import type { Profile } from '@/types/profile';

export const PersonalInformation = memo(function PersonalInformation() {
  const form = useFormContext<Profile>();

  return (
    <VStack gap={4} align="stretch">
      <HStack>
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
  );
});

PersonalInformation.displayName = 'PersonalInformation';
