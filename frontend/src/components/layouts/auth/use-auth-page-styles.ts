import { useToken } from '@chakra-ui/react';
import { useMemo } from 'react';

export function useAuthPageStyles() {
  const [controlRadius] = useToken('radii', ['sm']);
  const [borderSubtle, bgSubtle, bgMuted, fg] = useToken('colors', [
    'border.subtle',
    'bg.subtle',
    'bg.muted',
    'fg',
  ]);

  const rightPanelBackground = useMemo(() => {
    return `linear-gradient(135deg, ${bgSubtle}, ${bgMuted})`;
  }, [bgMuted, bgSubtle]);

  const clerkAppearance = useMemo(() => {
    return {
      elements: {
        card: {
          boxShadow: 'none',
          border: `1px solid ${borderSubtle}`,
          borderRadius: controlRadius,
          width: '100%',
          color: fg,
        },
        formButtonPrimary: {
          borderRadius: controlRadius,
        },
        footerActionLink: {
          borderRadius: controlRadius,
        },
        socialButtonsBlockButton: {
          borderRadius: controlRadius,
        },
        formFieldInput: {
          borderRadius: controlRadius,
        },
        identityPreviewEditButton: {
          borderRadius: controlRadius,
        },
      },
    };
  }, [borderSubtle, controlRadius, fg]);

  return {
    clerkAppearance,
    controlRadius,
    rightPanelBackground,
  };
}
