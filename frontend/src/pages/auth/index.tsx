import { Center, Heading, HStack, Text, VStack } from '@chakra-ui/react';
import { Navigate } from 'react-router';

import { useAuth } from '@/hooks/use-auth.hooks';
import { Loader } from '@/routes/base-route/Loader';

import { Form } from './form';
import gradient from './gradient.png';

export function AuthPage() {
  const { isLoaded, isSignedIn, isGuestMode } = useAuth();

  if (!isLoaded) {
    return <Loader />;
  }

  if (isSignedIn || isGuestMode) {
    return <Navigate to="/listings" replace />;
  }

  return (
    <HStack gap="0" align="stretch" minH="100vh" overflow="hidden">
      <Center flex="1">
        <Form />
      </Center>

      <VStack
        flex="1"
        minW="0"
        h="100vh"
        borderLeft="muted"
        overflow="hidden"
        bgImage={`url(${gradient})`}
        bgSize="cover"
        bgPos="bottom"
        bgRepeat="no-repeat"
        align="start"
        justify="end"
        p="2xl"
        color="white"
      >
        <Heading textStyle="4xl">Everything you need in one workflow</Heading>
        <Text>
          We automate the boring parts of job hunting, so you can focus on winning the interview.
        </Text>
      </VStack>
    </HStack>
  );
}
