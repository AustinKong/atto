import { Heading, Text, VStack } from '@chakra-ui/react';

import gradient from './gradient.png';

export function AuthAside() {
  return (
    <VStack
      minH="full"
      w="full"
      align="start"
      justify="end"
      p="2xl"
      color="white"
      bgImage={`url(${gradient})`}
      bgSize="cover"
      bgPos="bottom"
      bgRepeat="no-repeat"
    >
      <Heading textStyle="title-lg">Organize your job search without spreadsheet chaos.</Heading>
      <Text textStyle="body">
        Track applications, tailor resumes, and keep your job search data on your device.
      </Text>
    </VStack>
  );
}
