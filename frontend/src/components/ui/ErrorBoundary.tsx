import { Button, Center, Heading, Text, VStack } from '@chakra-ui/react';
import { isRouteErrorResponse, useRouteError } from 'react-router';

export function ErrorElement() {
  const error = useRouteError();

  const message = isRouteErrorResponse(error)
    ? error.statusText || 'An error occurred while loading this page.'
    : error && typeof error === 'object' && 'message' in error
      ? (error as Error).message
      : 'An error occurred while loading this page.';

  return (
    <Center h="full">
      <VStack>
        <Heading size="sm">Something went wrong</Heading>
        <Text color="fg.subtle">{message}</Text>
        <Button onClick={() => window.location.reload()}>Reload</Button>
      </VStack>
    </Center>
  );
}
