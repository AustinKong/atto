import type { StatsDateRange, StatsResponse } from '@/types/stats.types';

export async function getStats(startDate: StatsDateRange = '14d'): Promise<StatsResponse> {
  const params = new URLSearchParams({ startDate });
  const response = await fetch(`/api/stats?${params.toString()}`);

  if (!response.ok) {
    throw response;
  }

  const json = await response.json();
  return json as StatsResponse;
}
