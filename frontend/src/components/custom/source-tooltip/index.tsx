import { HoverCard, IconButton, type IconButtonProps, Portal, VStack } from '@chakra-ui/react';
import { LuGlobe } from 'react-icons/lu';

import { Source } from './Source';

export type Source = {
  url: string;
  title: string;
  content: string;
};

export function SourceTooltip({
  sources,
  size = 'xs',
  color = 'inherit',
}: {
  sources: Source[];
  size?: IconButtonProps['size'];
  color?: IconButtonProps['color'];
}) {
  return (
    <HoverCard.Root>
      <HoverCard.Trigger asChild>
        <IconButton size={size} color={color} variant="plain">
          <LuGlobe />
        </IconButton>
      </HoverCard.Trigger>
      <Portal>
        <HoverCard.Positioner>
          <HoverCard.Content>
            <VStack align="stretch" gap="md">
              {sources.map((source, index) => (
                <Source key={index} source={source} />
              ))}
            </VStack>
          </HoverCard.Content>
        </HoverCard.Positioner>
      </Portal>
    </HoverCard.Root>
  );
}
