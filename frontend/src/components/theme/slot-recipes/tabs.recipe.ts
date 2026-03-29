import { defineSlotRecipe } from '@chakra-ui/react';
import { tabsAnatomy } from '@chakra-ui/react/anatomy';

export const tabsRecipe = defineSlotRecipe({
  slots: tabsAnatomy.keys(),
  base: {
    root: {
      display: 'flex !important',
      flexDirection: 'column',
      height: 'full',
    },
    content: {
      flex: '1',
      overflowY: 'auto',
      py: 'xs',
    },
  },
});
