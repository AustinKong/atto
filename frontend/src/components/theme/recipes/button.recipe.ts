import { defineRecipe } from '@chakra-ui/react';

export const buttonRecipe = defineRecipe({
  base: {
    borderRadius: 'xs',
  },
  variants: {
    variant: {
      solid: { colorPalette: 'brand' },
    },
  },
});
