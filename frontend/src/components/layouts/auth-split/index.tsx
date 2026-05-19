import { Box, Center, HStack } from '@chakra-ui/react';
import type { ReactNode } from 'react';

export function AuthSplitLayout({ children, aside }: { children: ReactNode; aside: ReactNode }) {
  return (
    <HStack
      gap="0"
      align="stretch"
      h="100vh"
      w="100vw"
      overflow="hidden"
      flexDir={{ base: 'column', lg: 'row' }}
    >
      <Box w="50vw" overflowY="auto">
        <Center minH="full" p={{ base: 'lg', md: 'xl' }}>
          {children}
        </Center>
      </Box>

      <Box
        w="50vw"
        borderLeft={{ base: '0', lg: 'muted' }}
        borderTop={{ base: 'muted', lg: '0' }}
        overflowY="auto"
      >
        {aside}
      </Box>
    </HStack>
  );
}
