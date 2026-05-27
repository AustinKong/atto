import { Box, HStack, VStack } from '@chakra-ui/react';
import { Outlet } from 'react-router';
import { Navigate } from 'react-router';

import { useAuth } from '@/hooks/use-auth.hooks';
import { Loader } from '@/routes/base-route/Loader';

import { Navbar } from './navbar';
import { Popup } from './Popup';
import { Sidebar } from './sidebar';

export function DashboardLayout() {
  const { isLoaded, accessMode } = useAuth();

  if (!isLoaded) {
    return (
      <Box h="100vh">
        <Loader />
      </Box>
    );
  }

  if (accessMode === 'signed_out') {
    return <Navigate to="/auth" replace />;
  }

  return (
    <HStack w="100vw" h="100vh" overflow="hidden" gap="none">
      <Sidebar />
      <VStack w="full" minW="0" h="full" bg="bg" gap="none" align="stretch">
        <Navbar />
        <Box as="main" w="full" minW="0" flex="1" overflow="hidden" position="relative">
          <Outlet />
        </Box>
      </VStack>
      <Popup />
    </HStack>
  );
}
