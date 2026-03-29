import { defineSlotRecipe } from '@chakra-ui/react';
import { hoverCardAnatomy } from '@chakra-ui/react/anatomy';

export const hoverCardRecipe = defineSlotRecipe({
  slots: hoverCardAnatomy.keys(),
  base: {
    content: { borderRadius: 'sm' },
  },
});
