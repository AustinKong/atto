import { Box, Image, Text, VStack } from '@chakra-ui/react';

import type { ListingDraft } from '@/types/listing-draft.types';

export function Source({ listing }: { listing: ListingDraft }) {
  // Get screenshot from listing (base64-encoded PNG)
  const screenshot = (listing as { screenshot?: string }).screenshot;

  if (!screenshot) {
    return (
      <Box w="full" h="full" display="flex" alignItems="center" justifyContent="center">
        <VStack>
          <Text>No screenshot available</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box w="full" h="full" overflowY="auto" p={4}>
      <Image
        src={`data:image/png;base64,${screenshot}`}
        alt="Listing page screenshot"
        w="full"
        borderRadius="md"
        boxShadow="md"
      />
    </Box>
  );
}
