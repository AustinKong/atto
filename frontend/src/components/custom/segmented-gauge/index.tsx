import { Box, HStack, Text } from '@chakra-ui/react';

type GaugeSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_CONFIG: Record<GaugeSize, { barW: number; gapW: number; height: string }> = {
  xs: { barW: 2,   gapW: 1.5, height: '2' },
  sm: { barW: 2.5, gapW: 2,   height: '3' },
  md: { barW: 3,   gapW: 2.5, height: '4' },
  lg: { barW: 4,   gapW: 3,   height: '6' },
  xl: { barW: 6,   gapW: 4,   height: '8' },
};

const RED = 'var(--chakra-colors-fg-error)';
const YELLOW = 'var(--chakra-colors-fg-warning)';
const GREEN = 'var(--chakra-colors-fg-success)';
const EMPTY = 'var(--chakra-colors-bg-emphasized)';

interface SegmentedGaugeProps {
  percent?: number;
  tooltipLabel?: string;
  showPercentage?: boolean;
  height?: string;
  size?: GaugeSize;
  layout?: 'inline' | 'block';
}

// TODO: Make display snap to blocks so there are no weird half blocks, is there a way to do this by rounding? But low importance really.
export function SegmentedGauge({
  percent = 0,
  showPercentage = false,
  height,
  size = 'md',
  layout = 'inline',
}: SegmentedGaugeProps) {
  const { barW, gapW, height: sizeHeight } = SIZE_CONFIG[size];
  const resolvedHeight = height ?? sizeHeight;
  const totalW = barW + gapW;
  const percentAsPercentage = Math.min(1, Math.max(0, percent)) * 100;
  const roundedPercent = Math.round(percentAsPercentage);

  const gauge = (
    <Box
      w="full"
      h={resolvedHeight}
      background={`
          linear-gradient(to right,
            ${RED} 0%, 
            ${RED} ${Math.min(percentAsPercentage, 33)}%, 
            ${YELLOW} ${Math.min(percentAsPercentage, 33)}%, 
            ${YELLOW} ${Math.min(percentAsPercentage, 66)}%, 
            ${GREEN} ${Math.min(percentAsPercentage, 66)}%, 
            ${GREEN} ${percentAsPercentage}%, 
            ${EMPTY} ${percentAsPercentage}%, 
            ${EMPTY} 100%
          )
        `}
      style={{
        WebkitMaskImage: `repeating-linear-gradient(
            to right,
            black 0px,
            black ${barW}px,
            transparent ${barW}px,
            transparent ${totalW}px
          )`,
        backgroundSize: 'calc(100% + 2px) 100%',
      }}
    />
  );

  if (layout === 'inline' && showPercentage) {
    return (
      <HStack w="full" gap="sm" align="flex-end">
        <Box flex="1">{gauge}</Box>
        <Text fontFamily="monospace" fontSize="sm" minW="3ch">
          {String(roundedPercent).padStart(2, '0')}%
        </Text>
      </HStack>
    );
  }

  return gauge;
}
