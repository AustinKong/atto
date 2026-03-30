import { Heading, VStack } from '@chakra-ui/react';
import type { ReactNode } from 'react';

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <VStack align="stretch" gap="sm" textStyle="md">
      <Heading textStyle="md">{title}</Heading>
      {children}
    </VStack>
  );
}
