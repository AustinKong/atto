import { Box, HStack, VStack } from '@chakra-ui/react';
import { Outlet } from 'react-router';

import { Navbar } from './navbar';
import { Popup } from './Popup';
import { Sidebar } from './sidebar';

export function DashboardLayout() {
  return (
    <HStack w="100vw" h="100vh" overflow="hidden" gap="0">
      <Sidebar />
      <VStack w="full" h="full" bg="bg.main" gap="0" minW="0" align="stretch">
        <Navbar />
        <Box as="main" w="full" flex="1" overflow="hidden">
          <Outlet />
        </Box>
      </VStack>
      <Popup />
    </HStack>
  );
}
