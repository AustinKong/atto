import { defineSlotRecipe } from '@chakra-ui/react';
import { selectAnatomy } from '@chakra-ui/react/anatomy';

export const selectRecipe = defineSlotRecipe({
  slots: selectAnatomy.keys(),
  base: {
    trigger: { borderRadius: 'xs' },
    content: { borderRadius: 'sm' },
  },
});
