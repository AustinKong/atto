import { Button, Heading, Text, VStack } from '@chakra-ui/react';
import { LuArrowRight } from 'react-icons/lu';
import { useNavigate } from 'react-router';

import { useAuth } from '@/hooks/use-auth.hooks';
import { useEnterPaperMode } from '@/mutations/paper-mode.mutations';

export function Form() {
  const navigate = useNavigate();
  const { enterGuestMode } = useAuth();
  const enterPaperModeMutation = useEnterPaperMode(async () => {
    await enterGuestMode();
    navigate('/');
  });

  async function handleContinueAsGuest() {
    await enterGuestMode();
    navigate('/');
  }

  async function handleContinueWithPaperMode() {
    enterPaperModeMutation.mutate();
  }

  return (
    <VStack align="stretch" gap="lg" w="xl">
      <VStack align="start" gap="xs">
        <Heading textStyle="title-lg">Welcome to Atto</Heading>
        <Text textStyle="caption">
          Continue locally or explore a workspace filled with demo data.
        </Text>
      </VStack>

      <Button type="button" variant="solid" onClick={handleContinueAsGuest}>
        Continue Without Signing In <LuArrowRight />
      </Button>

      <Button
        type="button"
        variant="outline"
        loading={enterPaperModeMutation.isPending}
        onClick={handleContinueWithPaperMode}
      >
        Continue with paper mode <LuArrowRight />
      </Button>
    </VStack>
  );
}
