import { defineSlotRecipe } from '@chakra-ui/react';

export const tabsRecipe = defineSlotRecipe({
  slots: ['root', 'list', 'trigger', 'content'],
  base: {
    root: {
      display: 'flex !important',
      flexDirection: 'column',
      height: 'full',
    },
    content: {
      flex: '1',
      overflowY: 'auto',
      py: '2',
    },
  },
});
