import { HStack, Spacer } from '@chakra-ui/react';

import { ColorModeButton } from '@/components/ui/ColorMode';

import { Breadcrumb } from './Breadcrumb';
import { Profile } from './Profile';

export function Navbar() {
  return (
    <HStack
      as="nav"
      aria-label="Primary navigation"
      w="full"
      h="12"
      px="md"
      borderBottom="subtle"
    >
      <Breadcrumb />
      <Spacer />
      <ColorModeButton />
      <Profile />
    </HStack>
  );
}
