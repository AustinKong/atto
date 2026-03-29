'use client';

import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react';

import { themeConfig } from '../theme';
import { ColorModeProvider, type ColorModeProviderProps } from './ColorMode';

const customSystem = createSystem(defaultConfig, themeConfig);

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={customSystem}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  );
}
