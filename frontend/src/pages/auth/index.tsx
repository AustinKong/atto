import { Center, Heading, HStack, Text, VStack } from '@chakra-ui/react';
import { Navigate } from 'react-router';

import { useAuth } from '@/hooks/use-auth.hooks';
import { Loader } from '@/routes/base-route/Loader';

import { Form } from './form';
import gradient from './gradient.png';

export function AuthPage() {
  const { isLoaded, accessMode } = useAuth();

  if (!isLoaded) {
    return <Loader />;
  }

  if (accessMode !== 'signed_out') {
    return <Navigate to="/" replace />;
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
        <Heading textStyle="title-lg">Organize your job search without spreadsheet chaos.</Heading>
        <Text textStyle="body">
          Track applications, tailor resumes, and keep your job search data on your device.
        </Text>
      </VStack>
    </HStack>
  );
}
