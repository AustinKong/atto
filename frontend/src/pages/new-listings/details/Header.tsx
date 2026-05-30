import { Heading, HStack, Link as ChakraLink, VStack } from '@chakra-ui/react';

import { CompanyLogo } from '@/components/custom/CompanyLogo';
import type {
  ListingDraft,
  ListingDraftError,
  ListingDraftPending,
} from '@/types/listing-draft.types';

export function Header({
  listingDraft,
}: {
  listingDraft: Exclude<ListingDraft, ListingDraftPending | ListingDraftError>;
}) {
  const { domain, company, url } = getListingInfo(listingDraft);

  return (
    <HStack gap="sm" align="start">
      <CompanyLogo domain={domain} companyName={company || '?'} size="xl" />
      <VStack alignItems="start" gap="0" flex="1" minW="0">
        <Heading textStyle="title-lg" truncate w="full">
          {company}
        </Heading>
        <ChakraLink
          href={url}
          variant="underline"
          textStyle="caption"
          target="_blank"
          color="fg.info"
          truncate
          display="block"
          w="full"
        >
          {url}
        </ChakraLink>
      </VStack>
    </HStack>
  );
}

function getListingInfo(
  listingDraft: Exclude<ListingDraft, ListingDraftPending | ListingDraftError>
) {
  const url = listingDraft.url;

  switch (listingDraft.status) {
    case 'unique':
      return {
        domain: listingDraft.listing.domain,
        company: listingDraft.listing.company,
        url,
      };
    case 'duplicate_url':
      return {
        domain: listingDraft.duplicateOf.domain,
        company: listingDraft.duplicateOf.company,
        url,
      };
    case 'duplicate_content':
      return {
        domain: listingDraft.listing.domain || listingDraft.duplicateOf.domain,
        company: listingDraft.listing.company || listingDraft.duplicateOf.company,
        url,
      };
  }
}
