import { Box, Heading, Text } from '@chakra-ui/react';
import { ResponsiveLine } from '@nivo/line';
import { useMemo } from 'react';

import { nivoChartColors, nivoTheme } from '@/components/theme/nivo.theme';
import type { ApplicationHistory, ApplicationHistoryPoint } from '@/types/stats.types';
import { DateFormatPresets, ISODate as ISODateUtils } from '@/utils/date.utils';

import { formatStatusLabel } from './status-label.utils';

const X_AXIS_TICK_COUNT = 8;
const MESH_POINT_LIMIT = 750;

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

function formatHistoryTick(value: string | number | Date) {
  if (value instanceof Date) {
    return ISODateUtils.format(ISODateUtils.fromNativeDate(value), DateFormatPresets.monthDay);
  }

  const date = String(value);
  return ISODateUtils.is(date) ? ISODateUtils.format(date, DateFormatPresets.monthDay) : date;
}

export function ApplicationHistoryChart({ history }: { history: ApplicationHistory }) {
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
    <Box border="subtle" borderRadius="md" p="sm" h="md">
      <Heading size="sm" mb="sm">
        Application History
      </Heading>
      {hasHistoryData ? (
        <ResponsiveLine
          data={historyData}
          margin={{ top: 20, right: 24, bottom: 98, left: 56 }}
          xScale={{ type: 'time', format: '%Y-%m-%d', precision: 'day', useUTC: true }}
          xFormat={formatHistoryTick}
          yScale={{ type: 'linear', min: 0, max: 'auto', stacked: true, reverse: false }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickValues: X_AXIS_TICK_COUNT,
            format: formatHistoryTick,
            tickRotation: -30,
            legend: 'Date',
            legendOffset: 48,
            legendPosition: 'middle',
          }}
          axisLeft={{
            legend: 'Events',
            legendOffset: -44,
            legendPosition: 'middle',
          }}
          enableGridX={false}
          enablePoints={false}
          useMesh={history.points.length <= MESH_POINT_LIMIT}
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
              translateY: 60,
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
