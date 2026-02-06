import { Link as ChakraLink } from '@chakra-ui/react';
import { NavLink, useLocation } from 'react-router';

import { SidebarIcon, SidebarItem, SidebarLabel } from './index';

export function ExternalNavItem({
  isOpen,
  label,
  to,
  icon,
}: {
  isOpen: boolean;
  label: string;
  to: string;
  icon: React.ReactNode;
}) {
  return (
    <ChakraLink href={to} textDecoration="none" target="_blank" rel="noopener noreferrer">
      <SidebarItem
        _hover={{ bg: 'bg.muted' }}
        title={!isOpen ? label : undefined}
        w="full"
        color="fg.muted"
      >
        <SidebarIcon size="md" aria-hidden="true">
          {icon}
        </SidebarIcon>
        <SidebarLabel opacity={isOpen ? 1 : 0}>{label}</SidebarLabel>
      </SidebarItem>
    </ChakraLink>
  );
}

export function InternalNavItem({
  isOpen,
  label,
  to,
  icon,
  isActive,
}: {
  isOpen: boolean;
  label: string;
  to: string;
  icon: React.ReactNode;
  isActive?: (pathname: string) => boolean;
}) {
  const { pathname } = useLocation();
  const active = isActive ? isActive(pathname) : pathname.startsWith(to);

  return (
    <NavLink to={to}>
      {() => (
        <SidebarItem
          bg={active ? 'bg.emphasized' : 'transparent'}
          _hover={active ? undefined : { bg: 'bg.muted' }}
          title={label}
        >
          <SidebarIcon size="md" aria-hidden="true">
            {icon}
          </SidebarIcon>
          <SidebarLabel opacity={isOpen ? 1 : 0}>{label}</SidebarLabel>
        </SidebarItem>
      )}
    </NavLink>
  );
}
