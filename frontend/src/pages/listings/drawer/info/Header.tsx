import { Box, Heading, HStack, Link } from '@chakra-ui/react';

import { CompanyLogo } from '@/components/custom/CompanyLogo';
import type { Listing } from '@/types/listing.types';
import { formatListingBreadcrumb } from '@/utils/formatters/listing.formatters';

export function Header({ listing }: { listing: Listing }) {
  return (
    <HStack gap="xs">
      <CompanyLogo domain={listing.domain} companyName={listing.company} size="xl" />
      <Box flex="1" overflow="hidden">
        <Heading textStyle="title-lg" truncate>
          {formatListingBreadcrumb(listing)}
        </Heading>
        <Link
          href={listing.url}
          variant="underline"
          textStyle="caption"
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
