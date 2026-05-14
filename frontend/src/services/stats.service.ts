import type { StatsDateRange, StatsResponse } from '@/types/stats.types';
import { ISODate } from '@/utils/date.utils';

const UNIX_EPOCH_DATE = ISODate.parse('1970-01-01');

function resolveStartDate(dateRange: StatsDateRange) {
  if (dateRange === 'all') {
    return UNIX_EPOCH_DATE;
  }

  const days = Number.parseInt(dateRange, 10);
  const startDate = new Date();
  startDate.setUTCDate(startDate.getUTCDate() - days);
  return ISODate.fromNativeDate(startDate);
}

export async function getStats(startDate: StatsDateRange = '14d'): Promise<StatsResponse> {
  const params = new URLSearchParams({ startDate: resolveStartDate(startDate) });
  const url = `/api/dashboard/stats?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw response;
  }

  const json = await response.json();
  return json as StatsResponse;
}
