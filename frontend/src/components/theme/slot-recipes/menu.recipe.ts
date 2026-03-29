import { defineSlotRecipe } from '@chakra-ui/react';
import { menuAnatomy } from '@chakra-ui/react/anatomy';

export const menuRecipe = defineSlotRecipe({
  slots: menuAnatomy.keys(),
  base: {
    content: { borderRadius: 'sm' },
    item: { borderRadius: 'xs' },
  },
});
