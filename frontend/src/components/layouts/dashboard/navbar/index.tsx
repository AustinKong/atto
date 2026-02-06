import { HStack, Spacer } from '@chakra-ui/react';

import { ColorModeButton } from '@/components/ui/color-mode';

import { Breadcrumb } from './Breadcrumb';
import { Profile } from './Profile';

export function Navbar() {
  return (
    <HStack
      as="nav"
      aria-label="Primary navigation"
      w="full"
      h="12"
      px="4"
      borderBottom="1px solid"
      borderColor="border"
    >
      <Breadcrumb />
      <Spacer />
      <ColorModeButton />
      <Profile />
    </HStack>
  );
}
