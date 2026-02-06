import { Center, Heading, HStack, Image, Text } from '@chakra-ui/react';
import { NavLink } from 'react-router';

import { useColorModeValue } from '@/components/ui/color-mode';
import { getCurrentVersion } from '@/services/releaseNotes';

import { SidebarItem, SidebarLabel } from './index';

export function AppLogo({ isOpen }: { isOpen: boolean }) {
  const imageSrc = useColorModeValue('/light-icon.png', '/dark-icon.png');

  return (
    <NavLink to="/">
      <SidebarItem gap="2">
        <Center w="6" h="6" flexShrink={0}>
          <Image w="5" h="5" objectFit="contain" src={imageSrc} />
        </Center>
        <SidebarLabel opacity={isOpen ? 1 : 0} as={HStack}>
          <Heading as="h1" size="xl">
            Atto
          </Heading>
          <Text textStyle="xs" color="fg.muted">
            {getCurrentVersion()}
          </Text>
        </SidebarLabel>
      </SidebarItem>
    </NavLink>
  );
}
