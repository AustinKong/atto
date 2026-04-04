import { Button, Heading, HStack, Separator, Text, VStack } from '@chakra-ui/react';
import { LuArrowRight } from 'react-icons/lu';
import { useNavigate } from 'react-router';

import { useAuth } from '@/hooks/use-auth.hooks';

import { Email } from './Email';
import { OAuth } from './OAuth';

export function Form() {
  const navigate = useNavigate();
  const { enterGuestMode } = useAuth();

  function handleContinueAsGuest() {
    enterGuestMode();
    navigate('/listings');
  }

  return (
    <VStack align="stretch" gap="lg" w="xl">
      <VStack align="start" gap="xs">
        <Heading size="2xl">Welcome to Atto</Heading>
        <Text color="fg.muted">Sign in or create an account to get started.</Text>
      </VStack>

      <OAuth />

      <HStack gap="sm">
        <Separator flex="1" />
        <Text color="fg.muted" textStyle="sm">
          or
        </Text>
        <Separator flex="1" />
      </HStack>

      <Email />

      <Button type="button" variant="outline" onClick={handleContinueAsGuest}>
        Continue Without Signing In <LuArrowRight />
      </Button>
    </VStack>
  );
}
