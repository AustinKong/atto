import { FormatNumber, SimpleGrid, Stat } from '@chakra-ui/react';
import { LuActivity, LuBookmark, LuClock, LuMessageSquare, LuSend } from 'react-icons/lu';

import type { SummaryStats } from '@/types/stats.types';

import { DashboardStatCard } from './DashboardStatCard';

export function StatRow({ stats }: { stats: SummaryStats }) {
  return (
    <SimpleGrid columns={{ base: 1, sm: 2, md: 5 }} gap="sm">
      <DashboardStatCard
        label="Applications Saved"
        value={<FormatNumber value={stats.applicationsSaved.value ?? 0} />}
        icon={LuBookmark}
        trend={stats.applicationsSaved.trend}
      />
      <DashboardStatCard
        label="Applications Sent"
        value={<FormatNumber value={stats.applicationsSent.value ?? 0} />}
        icon={LuSend}
        trend={stats.applicationsSent.trend}
      />
      <DashboardStatCard
        label="Active Pipeline"
        value={<FormatNumber value={stats.activePipeline.value ?? 0} />}
        icon={LuActivity}
        trend={stats.activePipeline.trend}
      />
      <DashboardStatCard
        label="Response Rate"
        value={
          stats.responseRate.value === null ? (
            'N/A'
          ) : (
            <FormatNumber
              value={stats.responseRate.value}
              style="percent"
              maximumFractionDigits={0}
            />
          )
        }
        icon={LuMessageSquare}
        trend={stats.responseRate.trend}
      />
      <DashboardStatCard
        label="Avg First Response"
        value={
          stats.averageDaysToFirstResponse.value === null ? (
            'N/A'
          ) : (
            <>
              <FormatNumber
                value={stats.averageDaysToFirstResponse.value}
                maximumFractionDigits={1}
              />
              <Stat.ValueUnit>days</Stat.ValueUnit>
            </>
          )
        }
        icon={LuClock}
        trend={stats.averageDaysToFirstResponse.trend}
        positiveTrend="decrease"
      />
    </SimpleGrid>
  );
}
