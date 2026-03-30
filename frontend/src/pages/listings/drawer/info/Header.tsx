import { Box, HStack, Link, Text } from '@chakra-ui/react';

import { CompanyLogo } from '@/components/custom/CompanyLogo';
import type { Listing } from '@/types/listing.types';
import { formatListingBreadcrumb } from '@/utils/formatters/listing.formatters';

export function Header({ listing }: { listing: Listing }) {
  return (
    <HStack gap="xs">
      <CompanyLogo domain={listing.domain} companyName={listing.company} size="xl" />
      <Box flex="1" overflow="hidden">
        <Text textStyle="xl" fontWeight="bold" lineHeight="shorter" truncate>
          {formatListingBreadcrumb(listing)}
        </Text>
        <Link
          href={listing.url}
          variant="underline"
          textStyle="sm"
          target="_blank"
          color="fg.info"
          display="block"
          truncate
        >
          {listing.url}
        </Link>
      </Box>
    </HStack>
  );
}
