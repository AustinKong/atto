'use client';

import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react';

import { buttonRecipe } from '../theme/button.recipe';
import { closeButtonRecipe } from '../theme/close-button.recipe';
import { iconButtonRecipe } from '../theme/icon-button.recipe';
import { tabsRecipe } from '../theme/tabs.recipe';
import { ColorModeProvider, type ColorModeProviderProps } from './ColorMode';

const customSystem = createSystem(defaultConfig, {
  theme: {
    tokens: {
      fonts: {
        body: { value: '"IBM Plex Sans", sans-serif' },
        heading: { value: '"IBM Plex Sans Condensed", sans-serif' },
        mono: { value: '"IBM Plex Mono", monospace' },
      },
    },
    recipes: {
      button: buttonRecipe,
      iconButton: iconButtonRecipe,
      closeButton: closeButtonRecipe,
    },
    slotRecipes: {
      tabs: tabsRecipe,
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
