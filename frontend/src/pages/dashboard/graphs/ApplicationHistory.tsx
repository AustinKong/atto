import { Box, Heading, Text } from '@chakra-ui/react';
import { ResponsiveLine, svgDefaultProps as lineSvgDefaultProps } from '@nivo/line';
import { BasicTooltip } from '@nivo/tooltip';
import { useMemo } from 'react';

import { NivoTooltipPortalLayer } from '@/components/custom/nivo-tooltip-portal';
import { nivoTheme } from '@/components/theme/nivo.theme';
import type { ApplicationHistory } from '@/types/stats.types';
import { DateFormatPresets, ISODate as ISODateUtils } from '@/utils/date.utils';

import { getApplicationStatusChartColor } from './status-colors.utils';
import { formatStatusLabel } from './status-label.utils';

const X_AXIS_TICK_COUNT = 8;
const MESH_POINT_LIMIT = 750;

function formatHistoryTick(value: string | number | Date | null) {
  if (value === null) {
    return '';
  }

  if (value instanceof Date) {
    return ISODateUtils.format(ISODateUtils.fromNativeDate(value), DateFormatPresets.monthDay);
  }

  const date = String(value);
  return ISODateUtils.is(date) ? ISODateUtils.format(date, DateFormatPresets.monthDay) : date;
}

function formatHistoryTooltipDate(value: string | number | Date | null) {
  if (value === null) {
    return '';
  }

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
        id: status,
        data: history.points.map((point) => ({
          x: point.date,
          y: point.counts[status] ?? 0,
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
          margin={{ top: 20, right: 24, bottom: 72, left: 56 }}
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
            legend: 'Applications',
            legendOffset: -44,
            legendPosition: 'middle',
          }}
          enableGridX={false}
          enablePoints={false}
          useMesh={history.points.length <= MESH_POINT_LIMIT}
          enableArea
          areaOpacity={0.25}
          colors={getApplicationStatusChartColor}
          theme={nivoTheme}
          animate={false}
          layers={[...lineSvgDefaultProps.layers, NivoTooltipPortalLayer]}
          tooltip={({ point }) => (
            <BasicTooltip
              id={`${formatHistoryTooltipDate(point.data.x)}, ${formatStatusLabel(
                String(point.seriesId)
              )}: ${point.data.y}`}
              color={point.seriesColor}
              enableChip
            />
          )}
        />
      ) : (
        <Text color="fg.muted">No history data in this date range.</Text>
      )}
    </Box>
  );
}
