import { Box, HStack, VStack } from '@chakra-ui/react';
import { RedirectToSignIn } from '@clerk/react';
import { Outlet } from 'react-router';

import { useAuth } from '@/hooks/use-auth.hooks';
import { Loader } from '@/routes/base-route/Loader';

import { Navbar } from './navbar';
import { Popup } from './Popup';
import { Sidebar } from './sidebar';

export function DashboardLayout() {
  const { isLoaded, isSignedIn, isGuestMode } = useAuth();

  if (!isLoaded) {
    return (
      <Box h="100vh">
        <Loader />
      </Box>
    );
  }

  if (!isSignedIn && !isGuestMode) {
    return <RedirectToSignIn />;
  }

  return (
    <HStack w="100vw" h="100vh" overflow="hidden" gap="none">
      <Sidebar />
      <VStack w="full" h="full" bg="bg" gap="none" align="stretch">
        <Navbar />
        <Box as="main" w="full" flex="1" overflow="hidden" position="relative">
          <Outlet />
        </Box>
      </VStack>
      <Popup />
    </HStack>
  );
}
