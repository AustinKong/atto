import { Button, Heading, Text, VStack } from '@chakra-ui/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { LuArrowRight } from 'react-icons/lu';
import { useNavigate } from 'react-router';

import { useAuth } from '@/hooks/use-auth.hooks';
import { useEnterPaperMode } from '@/mutations/paper-mode.mutations';
import { settingsQueries } from '@/queries/setting.queries';
import type { SettingsSection } from '@/types/setting.types';

export function Form() {
  const navigate = useNavigate();
  const { enterGuestMode } = useAuth();
  const { data: settings } = useSuspenseQuery(settingsQueries.list());
  const enterPaperModeMutation = useEnterPaperMode(async () => {
    await enterGuestMode();
    navigate('/');
  });

  async function handleContinueAsGuest() {
    await enterGuestMode();
    navigate(hasModelSettings(settings) ? '/' : '/onboarding');
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

function hasModelSettings(settings: Record<string, SettingsSection>): boolean {
  const apiKey = settings.model?.fields.api_key?.value;
  const model = settings.model?.fields.llm?.value;

  return (
    typeof apiKey === 'string' &&
    apiKey.trim().length > 0 &&
    typeof model === 'string' &&
    model.trim().length > 0
  );
}
