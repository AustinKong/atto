import { defineSlotRecipe } from '@chakra-ui/react';
import { cardAnatomy } from '@chakra-ui/react/anatomy';

export const cardRecipe = defineSlotRecipe({
  slots: cardAnatomy.keys(),
  base: {
    root: { borderRadius: 'sm' },
  },
});
