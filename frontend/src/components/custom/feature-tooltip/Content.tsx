import { Button, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { LuLock, LuSparkles, LuZap } from 'react-icons/lu';
import { Link } from 'react-router';

export function Content({ hasCloud, hasApiKey }: { hasCloud: boolean; hasApiKey: boolean }) {
  if (hasCloud) {
    return (
      <VStack align="stretch" gap="sm">
        <HStack gap="xs">
          <Icon>
            <LuZap />
          </Icon>
          <Text textStyle="label" fontWeight="semibold">
            You're all set
          </Text>
        </HStack>
        <Text textStyle="xs" color="fg.muted">
          You're on the most capable plan. This feature runs on the cloud for the best results.
        </Text>
      </VStack>
    );
  }

  if (hasApiKey) {
    return (
      <VStack align="stretch" gap="sm">
        <HStack gap="xs">
          <Icon>
            <LuSparkles />
          </Icon>
          <Text textStyle="label" fontWeight="semibold">
            Supercharge this feature
          </Text>
        </HStack>
        <Text textStyle="xs" color="fg.muted">
          This feature works with your API key, but runs faster and more capably on the cloud.
        </Text>
        <Button size="xs" variant="outline" disabled>
          Sign up for cloud
        </Button>
      </VStack>
    );
  }

  return (
    <VStack align="stretch" gap="sm">
      <HStack gap="xs">
        <Icon>
          <LuLock />
        </Icon>
        <Text textStyle="label" fontWeight="semibold">
          Feature unavailable
        </Text>
      </HStack>
      <Text textStyle="xs" color="fg.muted">
        This feature requires either a cloud subscription or an LLM API key configured in settings.
      </Text>
      <VStack align="stretch" gap="xs">
        <Button size="xs" variant="outline" asChild>
          <Link to="/settings">Set up API key</Link>
        </Button>
        <Button size="xs" variant="ghost" disabled>
          Sign up for cloud
        </Button>
      </VStack>
    </VStack>
  );
}
