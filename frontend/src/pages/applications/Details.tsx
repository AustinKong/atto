import { Heading, VStack } from '@chakra-ui/react';

import type { Application } from '@/types/application.types';
import type { Listing } from '@/types/listing.types';

export function Details({ listing }: { application?: Application; listing: Listing }) {
  return (
    <VStack align="stretch">
      <Heading size="md">{listing.title}</Heading>
    </VStack>
  );
}
