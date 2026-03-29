import { defineRecipe } from '@chakra-ui/react';

export const buttonRecipe = defineRecipe({
  base: {
    py: '2xs',
    borderRadius: 'xs',
  },
  variants: {
    variant: {
      solid: { colorPalette: 'brand' },
    },
  },
});
