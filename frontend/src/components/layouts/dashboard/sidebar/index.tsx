import {
  Box,
  Center,
  chakra,
  Heading,
  HStack,
  Icon,
  Image,
  Link,
  Spacer,
  Text,
  VStack,
} from '@chakra-ui/react';
import {
  PiBookmarkSimple,
  PiCaretLeft,
  PiCaretRight,
  PiClipboard,
  PiGear,
  PiGithubLogo,
  PiPlus,
} from 'react-icons/pi';
import { NavLink, useLocation } from 'react-router';

import { useColorModeValue } from '@/components/ui/color-mode';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { getCurrentVersion } from '@/services/releaseNotes';

// FIXME: This component is doing too much abstraction to the point it becomes anti-productive.

type NavItemConfig = {
  label: string;
  path: string;
  icon: React.ReactNode;
  isActive?: (pathname: string) => boolean;
};

const NAV_ITEMS: NavItemConfig[] = [
  {
    label: 'Saved',
    path: '/listings',
    icon: <PiBookmarkSimple />,
    isActive: (path) =>
      path === '/listings' ||
      (!!path.match(/^\/listings\/[^/]+/) && !path.startsWith('/listings/new')),
  },
  { label: 'New Listing', path: '/listings/new', icon: <PiPlus /> },
  { label: 'Settings', path: '/settings', icon: <PiGear /> },
];

// TODO: Add release notes internal link to this
const BOTTOM_NAV_ITEMS: NavItemConfig[] = [
  {
    label: 'Feedback / Bug Report',
    path: 'https://forms.gle/SMe8QTp6e8dpDeYUA',
    icon: <PiClipboard />,
  },
  { label: 'GitHub', path: 'https://github.com/AustinKong/atto', icon: <PiGithubLogo /> },
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
        <Logo isOpen={isOpen} />
      </Box>

      <VStack as="nav" alignItems="stretch" gap="0" flex="1" p="2">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.path} isOpen={isOpen} item={item} isExternal={false} />
        ))}
      </VStack>

      <Spacer />

      <VStack alignItems="stretch" gap="0" p="2">
        {BOTTOM_NAV_ITEMS.map((item) => (
          <NavItem key={item.path} isOpen={isOpen} item={item} isExternal />
        ))}
      </VStack>

      <CollapseButton isOpen={isOpen} onToggle={onToggle} />
    </VStack>
  );
}

function Logo({ isOpen }: { isOpen: boolean }) {
  const imageSrc = useColorModeValue('/light-icon.png', '/dark-icon.png');

  return (
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
  );
}

function NavItem({
  isOpen,
  item,
  isExternal,
}: {
  isOpen: boolean;
  item: NavItemConfig;
  isExternal: boolean;
}) {
  const { pathname } = useLocation();
  const isActive = item.isActive ? item.isActive(pathname) : pathname.startsWith(item.path);

  if (isExternal) {
    return (
      <Link href={item.path} textDecoration="none" target="_blank" rel="noopener noreferrer">
        <SidebarItem
          bg={'transparent'}
          _hover={{ bg: 'bg.muted' }}
          title={!isOpen ? item.label : undefined}
          w="full"
          color="fg.muted"
        >
          <SidebarIcon size="md" aria-hidden="true">
            {item.icon}
          </SidebarIcon>
          <SidebarLabel opacity={isOpen ? 1 : 0}>{item.label}</SidebarLabel>
        </SidebarItem>
      </Link>
    );
  }

  return (
    <NavLink to={item.path}>
      {() => (
        <SidebarItem
          bg={isActive ? 'bg.emphasized' : 'transparent'}
          _hover={isActive ? undefined : { bg: 'bg.muted' }}
          aria-current={isActive ? 'page' : undefined}
          title={!isOpen ? item.label : undefined}
        >
          <SidebarIcon size="md" aria-hidden="true">
            {item.icon}
          </SidebarIcon>
          <SidebarLabel opacity={isOpen ? 1 : 0}>{item.label}</SidebarLabel>
        </SidebarItem>
      )}
    </NavLink>
  );
}

function CollapseButton({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
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

const SidebarItem = chakra(HStack, {
  base: {
    p: '1.5',
    h: '9',
    justifyContent: 'flex-start',
    overflow: 'hidden',
    borderRadius: 'sm',
    alignItems: 'center',
  },
});

const SidebarIcon = chakra(Icon, {
  base: {
    w: '6',
    aspectRatio: '1',
    flexShrink: 0,
    display: 'flex',
    justifyContent: 'center',
  },
});

const SidebarLabel = chakra(Text, {
  base: {
    fontSize: 'sm',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    transition: 'opacity 0.1s ease-in-out',
  },
});
