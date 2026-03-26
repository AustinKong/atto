'use client';

import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react';
import { switchAnatomy } from '@chakra-ui/react/anatomy';

import { buttonRecipe } from '../theme/button.recipe';
import { closeButtonRecipe } from '../theme/close-button.recipe';
import { iconButtonRecipe } from '../theme/icon-button.recipe';
import { tabsRecipe } from '../theme/tabs.recipe';
import { ColorModeProvider, type ColorModeProviderProps } from './ColorMode';

const customSystem = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: {
        // Orange palette (overrides Chakra's default orange)
        red: {
          '50': {
            value: '#FEF0F0',
          },
          '100': {
            value: '#FEDEDE',
          },
          '200': {
            value: '#FDC0C0',
          },
          '300': {
            value: '#FC9B9C',
          },
          '400': {
            value: '#FB7374',
          },
          '500': {
            value: '#FB3F43',
          },
          '600': {
            value: '#D4131B',
          },
          '700': {
            value: '#A20C12',
          },
          '800': {
            value: '#73060A',
          },
          '900': {
            value: '#440203',
          },
          '950': {
            value: '#300102',
          },
        },
        pink: {
          '50': {
            value: '#FEF0F4',
          },
          '100': {
            value: '#FCDEE6',
          },
          '200': {
            value: '#F9BFD0',
          },
          '300': {
            value: '#F79BB7',
          },
          '400': {
            value: '#F572A0',
          },
          '500': {
            value: '#F33D8A',
          },
          '600': {
            value: '#C6276D',
          },
          '700': {
            value: '#971B52',
          },
          '800': {
            value: '#6B1038',
          },
          '900': {
            value: '#3F061E',
          },
          '950': {
            value: '#2D0314',
          },
        },
        purple: {
          '50': {
            value: '#F7F1FE',
          },
          '100': {
            value: '#EDE0FE',
          },
          '200': {
            value: '#DDC4FD',
          },
          '300': {
            value: '#CDA4FC',
          },
          '400': {
            value: '#BE83FA',
          },
          '500': {
            value: '#B25FF9',
          },
          '600': {
            value: '#A01DEF',
          },
          '700': {
            value: '#7914B7',
          },
          '800': {
            value: '#550B83',
          },
          '900': {
            value: '#31044D',
          },
          '950': {
            value: '#220238',
          },
        },
        cyan: {
          '50': {
            value: '#E2F3FF',
          },
          '100': {
            value: '#C1E8FF',
          },
          '200': {
            value: '#78D4FF',
          },
          '300': {
            value: '#00BCEF',
          },
          '400': {
            value: '#00A1CD',
          },
          '500': {
            value: '#0084A8',
          },
          '600': {
            value: '#006987',
          },
          '700': {
            value: '#005067',
          },
          '800': {
            value: '#003749',
          },
          '900': {
            value: '#001F2A',
          },
          '950': {
            value: '#00131C',
          },
        },
        blue: {
          '50': {
            value: '#F1F3FF',
          },
          '100': {
            value: '#E3E7FF',
          },
          '200': {
            value: '#C2CCFF',
          },
          '300': {
            value: '#A5B5FF',
          },
          '400': {
            value: '#819BFF',
          },
          '500': {
            value: '#5983FF',
          },
          '600': {
            value: '#0063F1',
          },
          '700': {
            value: '#004ABA',
          },
          '800': {
            value: '#003181',
          },
          '900': {
            value: '#001C50',
          },
          '950': {
            value: '#001137',
          },
        },
        teal: {
          '50': {
            value: '#C1FBFF',
          },
          '100': {
            value: '#79F8FF',
          },
          '200': {
            value: '#00DFE7',
          },
          '300': {
            value: '#00C4CB',
          },
          '400': {
            value: '#00A7AD',
          },
          '500': {
            value: '#008A8F',
          },
          '600': {
            value: '#006C70',
          },
          '700': {
            value: '#005255',
          },
          '800': {
            value: '#00393B',
          },
          '900': {
            value: '#002021',
          },
          '950': {
            value: '#001415',
          },
        },
        green: {
          '50': {
            value: '#D1FFD7',
          },
          '100': {
            value: '#A6FFB4',
          },
          '200': {
            value: '#00F55C',
          },
          '300': {
            value: '#00DF53',
          },
          '400': {
            value: '#00C94A',
          },
          '500': {
            value: '#00B140',
          },
          '600': {
            value: '#008D31',
          },
          '700': {
            value: '#006822',
          },
          '800': {
            value: '#004614',
          },
          '900': {
            value: '#002808',
          },
          '950': {
            value: '#001804',
          },
        },
        yellow: {
          '50': {
            value: '#FFF5E5',
          },
          '100': {
            value: '#FFEFD2',
          },
          '200': {
            value: '#FFDF9A',
          },
          '300': {
            value: '#FFCF2F',
          },
          '400': {
            value: '#F0C100',
          },
          '500': {
            value: '#E0B400',
          },
          '600': {
            value: '#CFA600',
          },
          '700': {
            value: '#BF9900',
          },
          '800': {
            value: '#AF8C00',
          },
          '900': {
            value: '#574500',
          },
          '950': {
            value: '#302400',
          },
        },
        orange: {
          '50': {
            value: '#FFF0F0',
          },
          '100': {
            value: '#FEDEDC',
          },
          '200': {
            value: '#FEC0BB',
          },
          '300': {
            value: '#FD9C93',
          },
          '400': {
            value: '#FD7363',
          },
          '500': {
            value: '#FA4515',
          },
          '600': {
            value: '#C6350E',
          },
          '700': {
            value: '#972608',
          },
          '800': {
            value: '#6B1804',
          },
          '900': {
            value: '#3E0A01',
          },
          '950': {
            value: '#2D0501',
          },
        },
        // Zinc palette
        // gray: {
        //   50: { value: '#EEF1F5' },
        //   100: { value: '#DEE3EB' },
        //   200: { value: '#B9C4D7' },
        //   300: { value: '#98AAC4' },
        //   400: { value: '#7C8FAB' },
        //   500: { value: '#64748B' },
        //   600: { value: '#505D70' },
        //   700: { value: '#3B4554' },
        //   800: { value: '#272F39' },
        //   900: { value: '#171C23' },
        //   950: { value: '#0D1117' },
        // },
        // Slate palette
        gray: {
          50: { value: '#F3F3F4' },
          100: { value: '#E5E5E7' },
          200: { value: '#CECED2' },
          300: { value: '#B6B6BA' },
          400: { value: '#9D9DA4' },
          500: { value: '#888890' },
          600: { value: '#71717A' },
          700: { value: '#54545E' },
          800: { value: '#383840' },
          900: { value: '#1F1F24' },
          950: { value: '#131317' },
        },
      },
      fonts: {
        body: { value: '"IBM Plex Sans", sans-serif' },
        heading: { value: '"IBM Plex Sans Condensed", sans-serif' },
        mono: { value: '"IBM Plex Mono", monospace' },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: '{colors.orange.500}' },
          contrast: { value: '{colors.orange.50}' },
          fg: { value: '{colors.orange.700}' },
          muted: { value: '{colors.orange.100}' },
          subtle: { value: '{colors.orange.200}' },
          emphasized: { value: '{colors.orange.300}' },
          focusRing: { value: '{colors.orange.500}' },
        },
      },
    },
    recipes: {
      button: buttonRecipe,
      iconButton: iconButtonRecipe,
      closeButton: closeButtonRecipe,
      input: {
        base: {
          borderRadius: '2xs',
        },
      },
      textarea: {
        base: {
          borderRadius: '2xs',
        },
      },
    },
    slotRecipes: {
      tabs: tabsRecipe,
      select: {
        slots: ['trigger'],
        base: {
          trigger: {
            borderRadius: '2xs',
          },
        },
      },
      numberInput: {
        slots: ['root', 'input', 'control'],
        base: {
          input: {
            borderRadius: '2xs',
          },
          control: {
            borderRadius: '2xs',
          },
        },
      },
      // TODO: Apply xAnatomu payyern to all recipes, see explorer in chakra ui docs for this pattern
      switch: {
        slots: switchAnatomy.keys(),
        base: {
          control: {
            // TODO: Why tf this doesnt work aaaaa, editing css borderRadius works.
            borderRadius: '2xs !important',
            border: '1px solid red',
          },
          thumb: {
            borderRadius: '2xs',
          },
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
