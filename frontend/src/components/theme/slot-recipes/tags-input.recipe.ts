import { defineSlotRecipe } from '@chakra-ui/react';
import { tagsInputAnatomy } from '@chakra-ui/react/anatomy';

export const tagsInputRecipe = defineSlotRecipe({
  slots: tagsInputAnatomy.keys(),
  base: {
    root: { borderRadius: 'xs' },
  },
});
