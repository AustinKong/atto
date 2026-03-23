import { Box, HStack, Text } from '@chakra-ui/react';

const BAR_W_PX = 3;
const GAP_W_PX = 2.5;
const TOTAL_W_PX = BAR_W_PX + GAP_W_PX;

const RED = 'var(--chakra-colors-fg-error)';
const YELLOW = 'var(--chakra-colors-fg-warning)';
const GREEN = 'var(--chakra-colors-fg-success)';
const EMPTY = 'var(--chakra-colors-bg-emphasized)';

interface SegmentedGaugeProps {
  percent?: number;
  tooltipLabel?: string;
  showPercentage?: boolean;
  height?: string;
  layout?: 'inline' | 'block';
}

// TODO: Make display snap to blocks so there are no weird half blocks, is there a way to do this by rounding? But low importance really.
export function SegmentedGauge({
  percent = 0,
  showPercentage = false,
  height = '4',
  layout = 'inline',
}: SegmentedGaugeProps) {
  const percentAsPercentage = Math.min(1, Math.max(0, percent)) * 100;
  const roundedPercent = Math.round(percentAsPercentage);

  const gauge = (
    <Box
      w="full"
      h={height}
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
            black ${BAR_W_PX}px,
            transparent ${BAR_W_PX}px,
            transparent ${TOTAL_W_PX}px
          )`,
        backgroundSize: 'calc(100% + 2px) 100%',
      }}
    />
  );

  if (layout === 'inline' && showPercentage) {
    return (
      <HStack w="full" gap="3" align="flex-end">
        <Box flex="1">{gauge}</Box>
        <Text fontFamily="monospace" fontSize="sm" minW="3ch">
          {String(roundedPercent).padStart(2, '0')}%
        </Text>
      </HStack>
    );
  }

  return gauge;
}
