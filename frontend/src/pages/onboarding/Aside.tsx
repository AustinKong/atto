import { Alert, Heading, HStack, Spinner, Text, VStack } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Prose } from '@/components/ui/Prose';
import { onboardingQueries } from '@/queries/onboarding.queries';
import type { ModelProvider } from '@/types/onboarding.types';

import gradient from '../auth/gradient.png';

export function OnboardingAside({ provider }: { provider: ModelProvider | null }) {
  const setupGuideQuery = useQuery({
    ...onboardingQueries.setupGuide(provider ?? 'openai'),
    enabled: provider !== null,
  });

  if (!provider) {
    return (
      <VStack
        minH="full"
        w="full"
        align="start"
        justify="end"
        p="2xl"
        color="white"
        bgImage={`url(${gradient})`}
        bgSize="cover"
        bgPos="bottom"
        bgRepeat="no-repeat"
      >
        <Heading textStyle="title-lg">Bring your own model key.</Heading>
        <Text textStyle="body">
          Atto keeps your workspace local and only sends AI requests to the provider you choose.
        </Text>
      </VStack>
    );
  }

  return (
    <VStack
      minH="full"
      w="full"
      align="stretch"
      gap="md"
      p={{ base: 'lg', md: 'xl', lg: '2xl' }}
      bg="bg.panel"
    >
      {setupGuideQuery.isLoading ? (
        <HStack color="fg.muted" textStyle="caption">
          <Spinner size="sm" />
          <Text>Loading setup guide</Text>
        </HStack>
      ) : setupGuideQuery.isError ? (
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Setup guide unavailable</Alert.Title>
            <Alert.Description>
              Atto could not fetch the GitHub setup guide. Try again once the network is available.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      ) : (
        <Prose w="full" maxW="none">
          <Markdown remarkPlugins={[remarkGfm]}>{setupGuideQuery.data ?? ''}</Markdown>
        </Prose>
      )}
    </VStack>
  );
}
