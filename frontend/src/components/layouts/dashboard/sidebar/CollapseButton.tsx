import { Box } from '@chakra-ui/react';
import { PiCaretLeft, PiCaretRight } from 'react-icons/pi';

import { SidebarIcon, SidebarItem, SidebarLabel } from './index';

export function CollapseButton({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  return (
    <Box p="2">
      <SidebarItem
        as="button"
        w="full"
        cursor="pointer"
        _hover={{ bg: 'bg.muted' }}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        <SidebarIcon size="sm" aria-hidden="true">
          {isOpen ? <PiCaretLeft /> : <PiCaretRight />}
        </SidebarIcon>
        <SidebarLabel opacity={isOpen ? 1 : 0}>Collapse</SidebarLabel>
      </SidebarItem>
    </Box>
  );
}
