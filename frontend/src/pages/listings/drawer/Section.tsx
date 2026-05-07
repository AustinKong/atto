import { Heading, HStack, VStack } from '@chakra-ui/react';
import type { ReactNode } from 'react';

export function Section({
  title,
  children,
  action,
}: {
  title: ReactNode;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <VStack align="stretch" gap="sm" textStyle="md">
      {action ? (
        <HStack justify="space-between" align="center">
          <Heading textStyle="md">{title}</Heading>
          {action}
        </HStack>
      ) : (
        <Heading textStyle="md">{title}</Heading>
      )}
      {children}
    </VStack>
  );
}
