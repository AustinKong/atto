import { Box, VStack } from '@chakra-ui/react';
import { ResponsiveFunnel } from '@nivo/funnel';
import { memo } from 'react';

import { nivoTheme } from '@/components/theme/nivo.theme';
import type { StatusEnum } from '@/types/application.types';

// Funnel represents how many applications (out of 100) typically reach each stage.
// Stages progress left-to-right from applied → accepted.
const FUNNEL_STAGES: { id: StatusEnum; label: string; value: number }[] = [
  { id: 'applied', label: 'Applied', value: 100 },
  { id: 'screening', label: 'Screening', value: 72 },
  { id: 'interview', label: 'Interview', value: 40 },
  { id: 'offer_received', label: 'Offer', value: 15 },
  { id: 'accepted', label: 'Accepted', value: 8 },
];

// Colors matching the status colorPalette definitions
const STAGE_COLORS = [
  'var(--chakra-colors-blue-fg)',
  'var(--chakra-colors-cyan-fg)',
  'var(--chakra-colors-purple-fg)',
  'var(--chakra-colors-teal-fg)',
  'var(--chakra-colors-green-fg)',
];

interface ApplicationFunnelProps {
  currentStatus: StatusEnum;
}

export const ApplicationFunnel = memo(function ApplicationFunnel({
  currentStatus,
}: ApplicationFunnelProps) {
  const currentIndex = FUNNEL_STAGES.findIndex((s) => s.id === currentStatus);

  return (
    <VStack align="stretch" gap="1" h="full" minH="0">
      <Box flex="1" minH="0" w="full" position="relative">
        <ResponsiveFunnel
          data={FUNNEL_STAGES}
          direction="horizontal"
          valueFormat=">-.0f"
          colors={STAGE_COLORS}
          fillOpacity={0.8}
          borderWidth={2}
          borderColor={{ from: 'color', modifiers: [['darker', 0.4]] }}
          borderOpacity={0.5}
          spacing={4}
          shapeBlending={0.6}
          enableLabel
          labelColor={{ theme: 'background' }}
          animate={false}
          theme={nivoTheme}
          isInteractive
          // Highlight the current stage with an extended size
          currentPartSizeExtension={currentIndex >= 0 ? 6 : 0}
          currentBorderWidth={currentIndex >= 0 ? 4 : 2}
          beforeSeparatorLength={40}
          beforeSeparatorOffset={5}
          afterSeparatorLength={40}
          afterSeparatorOffset={5}
          layers={[
            'separators',
            'parts',
            'labels',
            // Custom layer to draw a "you are here" marker
            ({ parts }) => {
              if (currentIndex < 0 || currentIndex >= parts.length) return null;
              const part = parts[currentIndex];
              return (
                <g key="current-marker">
                  {/* Bright border around current stage */}
                  <rect
                    x={part.x0}
                    y={part.y0 - 4}
                    width={part.x1 - part.x0}
                    height={part.y1 - part.y0 + 8}
                    fill="none"
                    stroke="var(--chakra-colors-yellow-fg)"
                    strokeWidth={2}
                    strokeDasharray="4 3"
                    rx={2}
                  />
                  {/* "You" label above */}
                  <text
                    x={part.x}
                    y={part.y0 - 10}
                    textAnchor="middle"
                    fontSize="10"
                    fontFamily='"IBM Plex Mono", monospace'
                    fill="var(--chakra-colors-yellow-fg)"
                    fontWeight="bold"
                  >
                    ▼ you
                  </text>
                </g>
              );
            },
          ]}
        />
      </Box>
    </VStack>
  );
});
