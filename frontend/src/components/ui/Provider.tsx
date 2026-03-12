'use client';

import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react';

import { ColorModeProvider, type ColorModeProviderProps } from './ColorMode';

const customSystem = createSystem(defaultConfig, {
  theme: {
    tokens: {
      fonts: {
        body: { value: '"IBM Plex Sans", sans-serif' },
        heading: { value: '"IBM Plex Sans Condensed", sans-serif' },
      },
    },
    recipes: {
      button: {
        base: {
          px: '2',
          py: '1',
        },
      },
      iconButton: {
        base: {
          px: '2',
          py: '1',
        },
      },
      closeButton: {
        base: {
          px: '1',
          py: '1',
        },
      },
    },
  },
  globalCss: {
    '::-webkit-scrollbar': {
      width: '10px',
      height: '10px',
    },
    '::-webkit-scrollbar-thumb': {
      backgroundColor: 'fg.subtle',
      borderRadius: '0px',
    },
    '::-webkit-scrollbar-thumb:hover': {
      backgroundColor: 'fg.muted',
    },
    '::-webkit-scrollbar-track': {
      backgroundColor: 'bg.muted',
      borderRadius: '0px',
    },
  },
});

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={customSystem}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  );
}
