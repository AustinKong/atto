import { HoverCard, IconButton, type IconButtonProps, Portal } from '@chakra-ui/react';
import { LuLock, LuSparkles, LuZap } from 'react-icons/lu';

import { Content } from './Content';

// TODO: Make hasCloud and hasApiKey come from a hook
// Alternatively, make the hook return FeatureTooltip also for convenience
export function FeatureTooltip({
  hasCloud,
  hasApiKey,
  size = 'xs',
  color = 'inherit',
}: {
  hasCloud: boolean;
  hasApiKey: boolean;
  size?: IconButtonProps['size'];
  color?: IconButtonProps['color'];
}) {
  function getIcon() {
    if (hasCloud) return <LuZap />;
    if (hasApiKey) return <LuSparkles />;
    return <LuLock />;
  }

  return (
    <HoverCard.Root>
      <HoverCard.Trigger asChild>
        <IconButton size={size} color={color} variant="plain">
          {getIcon()}
        </IconButton>
      </HoverCard.Trigger>
      <Portal>
        <HoverCard.Positioner>
          <HoverCard.Content maxW="xs">
            <Content hasCloud={hasCloud} hasApiKey={hasApiKey} />
          </HoverCard.Content>
        </HoverCard.Positioner>
      </Portal>
    </HoverCard.Root>
  );
}
