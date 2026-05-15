import {
  STATS_DATE_RANGE_DAYS,
  type StatsDateRange,
  type StatsResponse,
} from '@/types/stats.types';
import { DEFAULT_STATS_DATE_RANGE } from '@/utils/stats.utils';

export async function getStats(
  dateRange: StatsDateRange = DEFAULT_STATS_DATE_RANGE
): Promise<StatsResponse> {
  const params = new URLSearchParams({ days: String(STATS_DATE_RANGE_DAYS[dateRange]) });
  const url = `/api/dashboard/stats?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw response;
  }

  const json = await response.json();
  return json as StatsResponse;
}
