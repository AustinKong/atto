import { createListCollection, Heading, HStack, Portal, Select, VStack } from '@chakra-ui/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router';

import { statsQueries } from '@/queries/stats.queries';
import { STATS_DATE_RANGES, type StatsDateRange } from '@/types/stats.types';

import { ApplicationFunnelChart } from './ApplicationFunnel';
import { ApplicationHistoryChart } from './ApplicationHistory';

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
      <ApplicationFunnelChart funnel={stats.applicationFunnel} />
      <ApplicationHistoryChart history={stats.applicationHistory} />
    </VStack>
  );
}
