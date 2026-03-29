import { badgeRecipe } from './recipes/badge.recipe';
import { buttonRecipe } from './recipes/button.recipe';
import { closeButtonRecipe } from './recipes/close-button.recipe';
import { iconButtonRecipe } from './recipes/icon-button.recipe';
import { inputRecipe } from './recipes/input.recipe';
import { skeletonRecipe } from './recipes/skeleton.recipe';
import { textareaRecipe } from './recipes/textarea.recipe';
import { colorSemanticTokens } from './semantic-tokens/colors';
import { spacingSemanticTokens } from './semantic-tokens/spacing';
import { alertRecipe } from './slot-recipes/alert.recipe';
import { cardRecipe } from './slot-recipes/card.recipe';
import { dialogRecipe } from './slot-recipes/dialog.recipe';
import { hoverCardRecipe } from './slot-recipes/hover-card.recipe';
import { menuRecipe } from './slot-recipes/menu.recipe';
import { numberInputRecipe } from './slot-recipes/number-input.recipe';
import { selectRecipe } from './slot-recipes/select.recipe';
import { tabsRecipe } from './slot-recipes/tabs.recipe';
import { tagsInputRecipe } from './slot-recipes/tags-input.recipe';
import { tooltipRecipe } from './slot-recipes/tooltip.recipe';
import { textStyles } from './text-styles';
import { borderTokens } from './tokens/borders';
import { colorTokens } from './tokens/colors';
import { fontTokens } from './tokens/fonts';

export const themeConfig = {
  theme: {
    tokens: {
      colors: colorTokens,
      fonts: fontTokens,
      borders: borderTokens,
    },
    textStyles,
    semanticTokens: {
      spacing: spacingSemanticTokens,
      colors: colorSemanticTokens,
    },
    recipes: {
      button: buttonRecipe,
      iconButton: iconButtonRecipe,
      closeButton: closeButtonRecipe,
      input: inputRecipe,
      textarea: textareaRecipe,
      badge: badgeRecipe,
      skeleton: skeletonRecipe,
    },
    slotRecipes: {
      tabs: tabsRecipe,
      dialog: dialogRecipe,
      menu: menuRecipe,
      tooltip: tooltipRecipe,
      card: cardRecipe,
      alert: alertRecipe,
      select: selectRecipe,
      numberInput: numberInputRecipe,
      hoverCard: hoverCardRecipe,
      tagsInput: tagsInputRecipe,
    },
  },
  globalCss: {
    '::-webkit-scrollbar': {
      width: '10px',
      height: '10px',
    },
    '::-webkit-scrollbar-thumb': {
      backgroundColor: 'fg.subtle',
      borderRadius: '0px',
    },
    '::-webkit-scrollbar-thumb:hover': {
      backgroundColor: 'fg.muted',
    },
    '::-webkit-scrollbar-track': {
      backgroundColor: 'bg.muted',
      borderRadius: '0px',
    },
  },
};
