import type { StatsDateRange, StatsResponse } from '@/types/stats.types';
import { ISODate } from '@/utils/date.utils';

function resolveStartDate(dateRange: StatsDateRange) {
  if (dateRange === 'all') {
    return undefined;
  }

  const days = Number.parseInt(dateRange, 10);
  const startDate = new Date();
  startDate.setUTCDate(startDate.getUTCDate() - days);
  return ISODate.fromNativeDate(startDate);
}

export async function getStats(startDate: StatsDateRange = '14d'): Promise<StatsResponse> {
  const params = new URLSearchParams();
  const resolvedStartDate = resolveStartDate(startDate);
  if (resolvedStartDate) {
    params.set('startDate', resolvedStartDate);
  }

  const url =
    params.size > 0 ? `/api/dashboard/stats?${params.toString()}` : '/api/dashboard/stats';
  const response = await fetch(url);

  if (!response.ok) {
    throw response;
  }

  const json = await response.json();
  return json as StatsResponse;
}
