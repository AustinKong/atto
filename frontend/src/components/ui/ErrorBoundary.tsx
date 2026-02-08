import { Button, Center, Heading, HStack, Text, VStack } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { isRouteErrorResponse, useRouteError } from 'react-router';
import { Link } from 'react-router';

function titleSubtitleBody(code: number): { title: string; subtitle: string; body?: ReactNode } {
  switch (code) {
    case 400:
      return {
        title: 'Bad Request',
        subtitle: 'The request was invalid. Check and try again.',
      };
    case 404:
      return {
        title: 'Resource Not Found',
        subtitle: 'Are you lost?',
        body: (
          <>
            <Button asChild size="xs">
              <Link to="/">Back to Home Page</Link>
            </Button>
          </>
        ),
      };
    case 429:
      return {
        title: 'Too Many Requests',
        subtitle: 'You are sending requests too quickly. Please wait a moment.',
      };
    case 500:
    default:
      return {
        title: 'Something went wrong',
        subtitle: 'An unexpected error occurred. Please try again later.',
      };
  }
}

export function ErrorElement() {
  const error = useRouteError();

  let status = 500;
  if (isRouteErrorResponse(error)) {
    status = error.status ?? status;
  } else if (error instanceof Response) {
    status = error.status ?? status;
  }

  const { title, subtitle, body } = titleSubtitleBody(status);

  return (
    <Center h="full">
      <VStack textAlign="center" gap="0">
        <Heading textStyle="6xl">{status}</Heading>
        <Heading>{title}</Heading>
        <Text color="fg.muted">{subtitle}</Text>

        {body && <HStack mt="4">{body}</HStack>}
      </VStack>
    </Center>
  );
}
