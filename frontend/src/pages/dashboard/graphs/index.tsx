import { Grid } from '@chakra-ui/react';
import { useMemo } from 'react';

import { STATUS_LIST, type StatusEnum } from '@/types/application.types';
import type { StatsResponse } from '@/types/stats.types';

import { ApplicationFunnelChart } from './ApplicationFunnel';
import { ApplicationHistoryChart } from './ApplicationHistory';
import { ApplicationStatusLegend } from './ApplicationStatusLegend';

export function ApplicationGraphs({ stats }: { stats: StatsResponse }) {
  const activeStatuses = useMemo(() => {
    const statuses = new Set<StatusEnum>(stats.applicationHistory.keys);
    stats.applicationFunnel.nodes.forEach((node) => {
      statuses.add(node.id);
    });

    return STATUS_LIST.filter((status) => statuses.has(status));
  }, [stats.applicationFunnel.nodes, stats.applicationHistory.keys]);

  return (
    <>
      <Grid templateColumns={{ base: '1fr', xl: '2fr 3fr' }} gap="md">
        <ApplicationFunnelChart funnel={stats.applicationFunnel} />
        <ApplicationHistoryChart history={stats.applicationHistory} />
      </Grid>
      <ApplicationStatusLegend statuses={activeStatuses} />
    </>
  );
}
