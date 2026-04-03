import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react';
import { Navigate, Outlet, useNavigate } from 'react-router';

import { useAuth } from '../../../hooks/use-auth.hooks';
import { useAuthPageStyles } from './use-auth-page-styles';

export function AuthLayout() {
  const { isLoaded, isSignedIn, enterGuestMode } = useAuth();
  const navigate = useNavigate();
  const { rightPanelBackground } = useAuthPageStyles();

  function handleContinueAsGuest() {
    enterGuestMode();
    navigate('/listings', { replace: true });
  }

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <Navigate to="/listings" replace />;
  }

  return (
    <Box bg="bg" minH="dvh" display="grid" gridTemplateColumns={{ base: '1fr', lg: '1fr 1fr' }}>
      <Box p={{ base: 'lg', md: '2xl' }} display="grid" alignItems="center" minH="dvh">
        <Box maxW="2xl" w="full" style={{ marginInline: 'auto' }}>
          <VStack gap="lg" w="full" maxW="2xl" align="stretch" style={{ marginInline: 'auto' }}>
            <VStack align="start" gap="xs">
              <Heading size="2xl">Welcome to Atto</Heading>
              <Text color="fg.muted">Sign in to sync cloud features, or continue locally.</Text>
            </VStack>

            <Outlet />

            <Button variant="outline" onClick={handleContinueAsGuest}>
              Continue Without Signing In
            </Button>
          </VStack>
        </Box>
      </Box>

      <Box
        display={{ base: 'none', lg: 'grid' }}
        borderLeft="subtle"
        p="2xl"
        alignItems="end"
        style={{ background: rightPanelBackground }}
      >
        <VStack align="start" gap="md" pb="lg">
          <Heading size="lg">Preview Area</Heading>
          <Text color="fg.muted">This panel is reserved for a future image or branded visual.</Text>
        </VStack>
      </Box>
    </Box>
  );
}
