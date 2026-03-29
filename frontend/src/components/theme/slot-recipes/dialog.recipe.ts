import { defineSlotRecipe } from '@chakra-ui/react';
import { dialogAnatomy } from '@chakra-ui/react/anatomy';

export const dialogRecipe = defineSlotRecipe({
  slots: dialogAnatomy.keys(),
  base: {
    content: { borderRadius: 'sm' },
  },
});
