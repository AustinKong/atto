import type { Theme } from '@nivo/theming';

// FIXME: Nivo Theme seems to not update in response to Chakra color mode changes.
// Opening the page in light mode, then switching to dark mode causes all colors to stay as old.
// Only on page refresh does the dark mode colors come in. Likely because Nivo's theming system doesn't support dynamic updates.
// Minor issue but should be investigated further.

// Also consider if there is an equivalent to useToken that can be used to reference Chakra tokens

// Maps Chakra UI v3 tokens to CSS variable references so Nivo themes
// automatically respond to light/dark mode and system font configuration.
const colorVar = (token: string) => `var(--chakra-colors-${token.replace(/\./g, '-')})`;
const fontSizeVar = (size: 'xs' | 'sm' | 'md' | 'lg') => `var(--chakra-font-sizes-${size})`;

// Color palette for Nivo charts using Chakra semantic tokens (.fg variant)
export const nivoChartColors = [
  colorVar('cyan.fg'),
  colorVar('pink.fg'),
  colorVar('red.fg'),
  colorVar('orange.fg'),
  colorVar('purple.fg'),
  colorVar('blue.fg'),
  colorVar('teal.fg'),
  colorVar('green.fg'),
  colorVar('yellow.fg'),
];

// Shared outline defaults required by Nivo's TextStyle type.
const textOutline = {
  outlineWidth: 0,
  outlineColor: 'transparent',
  outlineOpacity: 1,
};

export const nivoTheme: Theme = {
  background: 'transparent',
  text: {
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: fontSizeVar('sm'),
    fill: colorVar('fg.muted'),
    ...textOutline,
  },
  axis: {
    domain: {
      line: {
        stroke: colorVar('border.muted'),
        strokeWidth: 1,
      },
    },
    legend: {
      text: {
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: fontSizeVar('xs'),
        fill: colorVar('fg.muted'),
        ...textOutline,
      },
    },
    ticks: {
      line: {
        stroke: colorVar('border.subtle'),
        strokeWidth: 1,
      },
      text: {
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: fontSizeVar('xs'),
        fill: colorVar('fg.subtle'),
        ...textOutline,
      },
    },
  },
  grid: {
    line: {
      stroke: colorVar('border.subtle'),
      strokeWidth: 1,
    },
  },
  legends: {
    hidden: {
      symbol: { opacity: 0.4 },
      text: {
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: fontSizeVar('xs'),
        fill: colorVar('fg.subtle'),
        ...textOutline,
      },
    },
    text: {
      fontFamily: '"IBM Plex Mono", monospace',
      fontSize: fontSizeVar('sm'),
      fill: colorVar('fg.muted'),
      ...textOutline,
    },
    title: {
      text: {
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: fontSizeVar('sm'),
        fontWeight: 'bold',
        fill: colorVar('fg'),
        ...textOutline,
      },
    },
    ticks: {
      line: {},
      text: {
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: fontSizeVar('xs'),
        fill: colorVar('fg.subtle'),
        ...textOutline,
      },
    },
  },
  labels: {
    text: {
      fontFamily: '"IBM Plex Mono", monospace',
      fontSize: fontSizeVar('sm'),
      fontWeight: 'bold',
      fill: colorVar('fg'),
      ...textOutline,
    },
  },
  markers: {
    lineColor: colorVar('border'),
    lineStrokeWidth: 1,
    text: {
      fontFamily: '"IBM Plex Mono", monospace',
      fontSize: fontSizeVar('xs'),
      fill: colorVar('fg.muted'),
      ...textOutline,
    },
  },
  tooltip: {
    container: {
      background: colorVar('bg.panel'),
      color: colorVar('fg'),
      fontSize: fontSizeVar('sm'),
      borderRadius: 'var(--chakra-radii-md)',
      border: `1px solid ${colorVar('border.muted')}`,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      padding: '8px 12px',
    },
    basic: {},
    chip: {},
    table: {},
    tableCell: {},
    tableCellValue: {},
  },
  crosshair: {
    line: {
      stroke: colorVar('border'),
      strokeWidth: 1,
      strokeOpacity: 0.75,
      strokeDasharray: '6 4',
    },
  },
  dots: {
    text: {
      fontFamily: '"IBM Plex Mono", monospace',
      fontSize: fontSizeVar('xs'),
      fill: colorVar('fg.muted'),
      ...textOutline,
    },
  },
  annotations: {
    text: {
      fontFamily: '"IBM Plex Mono", monospace',
      fontSize: fontSizeVar('sm'),
      fill: colorVar('fg.muted'),
      outlineWidth: 2,
      outlineColor: colorVar('bg'),
      outlineOpacity: 1,
    },
    link: {
      stroke: colorVar('border'),
      strokeWidth: 1,
      outlineWidth: 2,
      outlineColor: colorVar('bg'),
      outlineOpacity: 1,
    },
    outline: {
      stroke: colorVar('border'),
      strokeWidth: 2,
      outlineWidth: 2,
      outlineColor: colorVar('bg'),
      outlineOpacity: 1,
    },
    symbol: {
      fill: colorVar('fg.muted'),
      outlineWidth: 2,
      outlineColor: colorVar('bg'),
      outlineOpacity: 1,
    },
  },
};
