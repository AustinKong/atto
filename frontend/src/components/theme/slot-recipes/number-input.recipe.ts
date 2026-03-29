import { defineSlotRecipe } from '@chakra-ui/react';
import { numberInputAnatomy } from '@chakra-ui/react/anatomy';

export const numberInputRecipe = defineSlotRecipe({
  slots: numberInputAnatomy.keys(),
  base: {
    root: { borderRadius: 'xs' },
    input: { borderRadius: 'xs' },
  },
});
