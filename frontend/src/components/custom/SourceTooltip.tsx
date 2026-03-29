import { HoverCard, HStack, Icon, Portal, Text, VStack } from '@chakra-ui/react';
import { LuArrowUpRight, LuGlobe } from 'react-icons/lu';
import { Link } from 'react-router';

import { CompanyLogo } from './CompanyLogo';

type Source = {
  url: string;
  title: string;
  content: string;
};

interface SourceTooltipProps {
  sources: Source[];
}

export function SourceTooltip({ sources }: SourceTooltipProps) {
  return (
    <HoverCard.Root>
      <HoverCard.Trigger asChild>
        <Icon size="xs" cursor="pointer">
          <LuGlobe />
        </Icon>
      </HoverCard.Trigger>
      <Portal>
        <HoverCard.Positioner>
          <HoverCard.Content>
            <VStack align="stretch" gap="sm">
              {sources.map((source, index) => {
                const domain = new URL(source.url).hostname.replace('www.', '');
                return (
                  <VStack
                    key={index}
                    align="stretch"
                    gap="xs"
                    pb={index < sources.length - 1 ? '2' : '0'}
                    borderBottom={index < sources.length - 1 ? '1px solid' : 'none'}
                    borderColor="border.muted"
                  >
                    <HStack gap="xs" align="center" asChild cursor="pointer">
                      <Link to={source.url} target="_blank" rel="noopener noreferrer">
                        <CompanyLogo
                          domain={domain}
                          companyName={source.title}
                          size="2xs"
                          flexShrink={0}
                        />
                        <Text fontWeight="medium" fontSize="sm" truncate flex="1">
                          {source.title}
                        </Text>
                        <Icon boxSize="3.5" flexShrink={0} color="fg.muted">
                          <LuArrowUpRight />
                        </Icon>
                      </Link>
                    </HStack>
                    <Text fontSize="sm" color="fg.muted" lineHeight="tight">
                      {source.content}
                    </Text>
                  </VStack>
                );
              })}
            </VStack>
          </HoverCard.Content>
        </HoverCard.Positioner>
      </Portal>
    </HoverCard.Root>
  );
}
