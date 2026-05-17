import { createListCollection, Heading, HStack, Portal, Select, VStack } from '@chakra-ui/react';
import { useSuspenseQuery } from '@tanstack/react-query';

import { type ParamHandler, useUrlSyncedState } from '@/hooks/use-url-synced-state.hooks';
import { statsQueries } from '@/queries/stats.queries';
import type { StatsDateRange } from '@/types/stats.types';
import {
  DEFAULT_STATS_DATE_RANGE,
  parseStatsDateRange,
  parseStatsDateRangeOrDefault,
} from '@/utils/stats.utils';

import { ApplicationGraphs } from './graphs';
import { StatRow } from './stat-row';

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

const statsDateRangeHandler: ParamHandler<StatsDateRange> = {
  serialize: (value) => value,
  deserialize: (params, key) => parseStatsDateRange(params.get(key)),
};

export function DashboardPage() {
  const [dateRange, setDateRange] = useUrlSyncedState('range', DEFAULT_STATS_DATE_RANGE, {
    custom: statsDateRangeHandler,
  });
  const { data: stats } = useSuspenseQuery(statsQueries.item(dateRange));

  return (
    <VStack h="full" overflowY="auto" align="stretch" p="md" gap="md">
      <HStack justifyContent="space-between" alignItems="center">
        <Heading size="lg">Dashboard</Heading>
        <Select.Root
          width="12rem"
          collection={DATE_RANGE_OPTIONS}
          value={[dateRange]}
          onValueChange={({ value }) => {
            setDateRange(parseStatsDateRangeOrDefault(value[0]));
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
      <StatRow stats={stats.summary} />
      <ApplicationGraphs stats={stats} />
    </VStack>
  );
}
