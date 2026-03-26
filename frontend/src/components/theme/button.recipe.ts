import { defineRecipe } from '@chakra-ui/react';

export const buttonRecipe = defineRecipe({
  base: {
    px: '2',
    py: '1',
    borderRadius: '2xs',
  },
  variants: {
    variant: {
      solid: { colorPalette: 'brand' },
    },
  },
});
