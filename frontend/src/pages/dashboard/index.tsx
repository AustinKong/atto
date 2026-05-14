import {
  Box,
  createListCollection,
  Heading,
  HStack,
  Portal,
  Select,
  Text,
  VStack,
} from '@chakra-ui/react';
import { ResponsiveLine } from '@nivo/line';
import { ResponsiveSankey } from '@nivo/sankey';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router';

import { nivoChartColors, nivoTheme } from '@/components/theme/nivo.theme';
import { statsQueries } from '@/queries/stats.queries';
import type { ApplicationHistoryPoint, StatsDateRange } from '@/types/stats.types';
import { STATS_DATE_RANGES } from '@/types/stats.types';

const DATE_RANGE_OPTIONS = createListCollection({
  items: [
    { label: '1 week', value: '7d' },
    { label: '2 weeks', value: '14d' },
    { label: '1 month', value: '30d' },
    { label: '3 months', value: '90d' },
    { label: '6 months', value: '180d' },
    { label: 'All time', value: 'all' },
  ] as const,
});

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

function formatStatusLabel(status: string) {
  return status
    .split('_')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

function parseDateRange(value: string | null): StatsDateRange {
  if (value && STATS_DATE_RANGES.includes(value as StatsDateRange)) {
    return value as StatsDateRange;
  }
  return '14d';
}

export function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dateRange = parseDateRange(searchParams.get('startDate'));
  const { data: stats } = useSuspenseQuery(statsQueries.item(dateRange));

  const historyData = useMemo(
    () =>
      stats.applicationHistory.keys.map((status) => ({
        id: formatStatusLabel(status),
        data: stats.applicationHistory.points.map((point) => ({
          x: point.date,
          y: HISTORY_VALUE_ACCESSORS[status](point),
        })),
      })),
    [stats.applicationHistory.keys, stats.applicationHistory.points]
  );

  const hasHistoryData = historyData.some((series) => series.data.some((point) => point.y > 0));

  return (
    <VStack h="full" overflowY="auto" align="stretch" p="md" gap="md">
      <HStack justifyContent="space-between" alignItems="center">
        <Heading size="lg">Dashboard</Heading>
        <Select.Root
          width="12rem"
          collection={DATE_RANGE_OPTIONS}
          value={[dateRange]}
          onValueChange={({ value }) => {
            const next = parseDateRange(value[0]);
            const nextParams = new URLSearchParams(searchParams);
            nextParams.set('startDate', next);
            setSearchParams(nextParams);
          }}
        >
          <Select.HiddenSelect />
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText placeholder="Date range" />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Portal>
            <Select.Positioner>
              <Select.Content>
                {DATE_RANGE_OPTIONS.items.map((item) => (
                  <Select.Item key={item.value} item={item}>
                    {item.label}
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Portal>
        </Select.Root>
      </HStack>

      <Box border="subtle" borderRadius="md" p="sm" h="24rem">
        <Heading size="sm" mb="sm">
          Application Funnel
        </Heading>
        {stats.applicationFunnel.links.length > 0 ? (
          <ResponsiveSankey
            data={stats.applicationFunnel}
            margin={{ top: 20, right: 140, bottom: 20, left: 50 }}
            align="justify"
            colors={nivoChartColors}
            nodeOpacity={1}
            nodeBorderWidth={0}
            label={(node) => formatStatusLabel(String(node.id))}
            labelTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
            sort="descending"
            linkOpacity={0.4}
            linkHoverOpacity={0.6}
            enableLinkGradient
            theme={nivoTheme}
            animate={false}
          />
        ) : (
          <Text color="fg.muted">No funnel data in this date range.</Text>
        )}
      </Box>

      <Box border="subtle" borderRadius="md" p="sm" h="24rem">
        <Heading size="sm" mb="sm">
          Application History
        </Heading>
        {hasHistoryData ? (
          <ResponsiveLine
            data={historyData}
            margin={{ top: 20, right: 24, bottom: 60, left: 56 }}
            xScale={{ type: 'point' }}
            xFormat="time:%Y-%m-%d"
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
    </VStack>
  );
}
