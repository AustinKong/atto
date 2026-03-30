import { HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { LuArrowUpRight } from 'react-icons/lu';
import { Link } from 'react-router';

import { CompanyLogo } from '../CompanyLogo';
import type { Source } from './index';

export function Source({ source }: { source: Source }) {
  const domain = new URL(source.url).hostname.replace('www.', '');

  return (
    <VStack align="stretch" gap="xs">
      <HStack gap="xs" align="center" asChild cursor="pointer">
        <Link to={source.url} target="_blank" rel="noopener noreferrer">
          <CompanyLogo domain={domain} companyName={source.title} size="2xs" flexShrink={0} />
          <Text fontWeight="medium" fontSize="sm" truncate flex="1">
            {source.title}
          </Text>
          <Icon color="fg.muted" size="md">
            <LuArrowUpRight />
          </Icon>
        </Link>
      </HStack>
      <Text fontSize="sm" color="fg.muted" lineHeight="tight">
        {source.content}
      </Text>
    </VStack>
  );
}
