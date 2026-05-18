import { Badge, FormatNumber, HStack, Icon, Stat } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import type { IconType } from 'react-icons';

type TrendDirection = 'increase' | 'decrease';

export function DashboardStatCard({
  label,
  value,
  icon,
  trend,
  positiveTrend = 'increase',
}: {
  label: string;
  value: ReactNode;
  icon: IconType;
  trend: number | null;
  positiveTrend?: TrendDirection;
}) {
  const StatIcon = icon;
  const hasTrend = trend !== null;
  const isPositiveTrend = hasTrend && (positiveTrend === 'increase' ? trend >= 0 : trend <= 0);
  const trendColor = isPositiveTrend ? 'fg.success' : 'fg.error';

  return (
    <Stat.Root bg="bg.panel" border="subtle" borderRadius="md" minH="5rem" minW="0" p="xs">
      <HStack justifyContent="space-between" alignItems="flex-start" gap="xs">
        <Stat.Label textStyle="caption">{label}</Stat.Label>
        <Icon color="fg.muted" boxSize="4">
          <StatIcon />
        </Icon>
      </HStack>
      <HStack alignItems="baseline" gap="xs" mt="2xs" wrap="wrap">
        <Stat.ValueText alignItems="baseline" textStyle="title-lg">
          {value}
        </Stat.ValueText>
        {hasTrend && (
          <Badge
            colorPalette={isPositiveTrend ? 'green' : 'red'}
            gap="0"
            px="1"
            textStyle="caption"
            variant="subtle"
          >
            {trend >= 0 ? (
              <Stat.UpIndicator color={trendColor} />
            ) : (
              <Stat.DownIndicator color={trendColor} />
            )}
            <FormatNumber value={Math.abs(trend)} style="percent" maximumFractionDigits={0} />
          </Badge>
        )}
      </HStack>
    </Stat.Root>
  );
}
