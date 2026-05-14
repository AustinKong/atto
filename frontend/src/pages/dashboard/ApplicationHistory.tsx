import { Box, Heading, Text } from '@chakra-ui/react';
import { ResponsiveLine } from '@nivo/line';
import { useMemo } from 'react';

import { nivoChartColors, nivoTheme } from '@/components/theme/nivo.theme';
import type { ApplicationHistory, ApplicationHistoryPoint } from '@/types/stats.types';

const HISTORY_VALUE_ACCESSORS = {
  saved: (point: ApplicationHistoryPoint) => point.saved,
  applied: (point: ApplicationHistoryPoint) => point.applied,
  screening: (point: ApplicationHistoryPoint) => point.screening,
  interview: (point: ApplicationHistoryPoint) => point.interview,
  offer_received: (point: ApplicationHistoryPoint) => point.offerReceived,
  accepted: (point: ApplicationHistoryPoint) => point.accepted,
  rejected: (point: ApplicationHistoryPoint) => point.rejected,
  ghosted: (point: ApplicationHistoryPoint) => point.ghosted,
  withdrawn: (point: ApplicationHistoryPoint) => point.withdrawn,
  rescinded: (point: ApplicationHistoryPoint) => point.rescinded,
} as const;

type ApplicationHistoryChartProps = {
  history: ApplicationHistory;
};

function formatStatusLabel(status: string) {
  return status
    .split('_')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

export function ApplicationHistoryChart({ history }: ApplicationHistoryChartProps) {
  const historyData = useMemo(
    () =>
      history.keys.map((status) => ({
        id: formatStatusLabel(status),
        data: history.points.map((point) => ({
          x: point.date,
          y: HISTORY_VALUE_ACCESSORS[status](point),
        })),
      })),
    [history.keys, history.points]
  );

  const hasHistoryData = historyData.some((series) => series.data.some((point) => point.y > 0));

  return (
    <Box border="subtle" borderRadius="md" p="sm" h="24rem">
      <Heading size="sm" mb="sm">
        Application History
      </Heading>
      {hasHistoryData ? (
        <ResponsiveLine
          data={historyData}
          margin={{ top: 20, right: 24, bottom: 60, left: 56 }}
          xScale={{ type: 'point' }}
          yScale={{ type: 'linear', min: 0, max: 'auto', stacked: true, reverse: false }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickRotation: -30,
            legend: 'Date',
            legendOffset: 52,
            legendPosition: 'middle',
          }}
          axisLeft={{
            legend: 'Events',
            legendOffset: -44,
            legendPosition: 'middle',
          }}
          enableGridX={false}
          enablePoints={false}
          useMesh
          enableArea
          areaOpacity={0.25}
          colors={nivoChartColors}
          theme={nivoTheme}
          animate={false}
          legends={[
            {
              anchor: 'bottom',
              direction: 'row',
              justify: false,
              translateY: 58,
              itemWidth: 95,
              itemHeight: 16,
              symbolSize: 10,
              symbolShape: 'circle',
            },
          ]}
        />
      ) : (
        <Text color="fg.muted">No history data in this date range.</Text>
      )}
    </Box>
  );
}
