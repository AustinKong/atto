'use client';

import { ChakraProvider } from '@chakra-ui/react';

import customSystem from '../theme';
import { ColorModeProvider, type ColorModeProviderProps } from './ColorMode';

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={customSystem}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  );
}
