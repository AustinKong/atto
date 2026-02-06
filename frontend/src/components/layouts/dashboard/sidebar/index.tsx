import { Box, chakra, HStack, Icon, Spacer, Text, VStack } from '@chakra-ui/react';
import { LuBookmark, LuClipboard, LuGithub, LuPlus, LuSettings } from 'react-icons/lu';

import { useLocalStorage } from '@/hooks/useLocalStorage';

import { AppLogo } from './AppLogo';
import { CollapseButton } from './CollapseButton';
import { ExternalNavItem, InternalNavItem } from './NavItem';

const INTERNAL_NAV_ITEMS = [
  {
    label: 'Saved',
    path: '/listings',
    icon: <LuBookmark />,
    isActive: (path: string) =>
      path === '/listings' ||
      (!!path.match(/^\/listings\/[^/]+/) && !path.startsWith('/listings/new')),
  },
  { label: 'New Listing', path: '/listings/new', icon: <LuPlus /> },
  { label: 'Settings', path: '/settings', icon: <LuSettings /> },
];

const EXTERNAL_NAV_ITEMS = [
  {
    label: 'Feedback / Bug Report',
    path: 'https://forms.gle/SMe8QTp6e8dpDeYUA',
    icon: <LuClipboard />,
  },
  { label: 'GitHub', path: 'https://github.com/AustinKong/atto', icon: <LuGithub /> },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useLocalStorage('sidebar-open', true);

  const onToggle = () => setIsOpen(!isOpen);

  return (
    <VStack
      as="aside"
      minW={isOpen ? '60' : '3.25rem'}
      w={isOpen ? '60' : '3.25rem'}
      bg="bg.subtle"
      h="full"
      alignItems="stretch"
      transition="all 0.1s ease-in-out"
      borderRight="1px solid"
      borderColor="border"
      gap="0"
    >
      <Box
        h="12"
        px="2"
        borderBottom="1px solid"
        borderColor="border"
        display="flex"
        alignItems="center"
      >
        <AppLogo isOpen={isOpen} />
      </Box>

      <VStack as="nav" alignItems="stretch" gap="0" p="2">
        {INTERNAL_NAV_ITEMS.map((item) => (
          <InternalNavItem
            key={item.path}
            isOpen={isOpen}
            label={item.label}
            to={item.path}
            icon={item.icon}
            isActive={item.isActive}
          />
        ))}
      </VStack>

      <Spacer />

      <VStack alignItems="stretch" gap="0" p="2">
        {EXTERNAL_NAV_ITEMS.map((item) => (
          <ExternalNavItem
            key={item.path}
            isOpen={isOpen}
            label={item.label}
            to={item.path}
            icon={item.icon}
          />
        ))}
      </VStack>

      <CollapseButton isOpen={isOpen} onToggle={onToggle} />
    </VStack>
  );
}

export const SidebarItem = chakra(HStack, {
  base: {
    p: '1.5',
    h: '9',
    justifyContent: 'flex-start',
    overflow: 'hidden',
    borderRadius: 'sm',
    alignItems: 'center',
  },
});

export const SidebarIcon = chakra(Icon, {
  base: {
    w: '6',
    aspectRatio: '1',
    flexShrink: 0,
    display: 'flex',
    justifyContent: 'center',
  },
});

export const SidebarLabel = chakra(Text, {
  base: {
    fontSize: 'sm',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    transition: 'opacity 0.1s ease-in-out',
  },
});
